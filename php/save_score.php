<?php
// Simple score saver using JSON file storage
// Works on WAMP/XAMPP/LAMP. Ensure php/ and data/ folders are writable.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$name = isset($_POST['name']) ? trim($_POST['name']) : 'Player';
$score = isset($_POST['score']) ? intval($_POST['score']) : 0;
$level = isset($_POST['level']) ? intval($_POST['level']) : 1;

$record = [
  'name' => $name,
  'score' => $score,
  'level' => $level,
  'ts' => time(),
];

$dataFile = __DIR__ . '/../data/scores.json';
if (!file_exists(dirname($dataFile))) {
  @mkdir(dirname($dataFile), 0777, true);
}
if (!file_exists($dataFile)) {
  file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT));
}

$locked = false;
$fp = fopen($dataFile, 'c+');
if ($fp) {
  if (flock($fp, LOCK_EX)) { $locked = true; }
}

if (!$fp) {
  echo json_encode(['ok' => false, 'error' => 'cannot_open_file']);
  exit;
}

try {
  $size = filesize($dataFile);
  $raw = $size > 0 ? fread($fp, $size) : '[]';
  $list = json_decode($raw, true);
  if (!is_array($list)) { $list = []; }

  $list[] = $record;

  // Sort high to low by score
  usort($list, function($a, $b) { return $b['score'] <=> $a['score']; });
  $total = count($list);
  $highest = $total > 0 ? $list[0]['score'] : $score;
  // Rank of current record (first match by time)
  $rank = 1;
  foreach ($list as $i => $r) {
    if ($r['ts'] === $record['ts'] && $r['name'] === $record['name']) { $rank = $i + 1; break; }
  }

  // Keep top 100
  $list = array_slice($list, 0, 100);

  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($list, JSON_PRETTY_PRINT));

  echo json_encode(['ok' => true, 'rank' => $rank, 'total' => $total, 'highest' => $highest]);
} catch (Throwable $e) {
  echo json_encode(['ok' => false, 'error' => 'server_error']);
} finally {
  if ($locked) { flock($fp, LOCK_UN); }
  fclose($fp);
}


