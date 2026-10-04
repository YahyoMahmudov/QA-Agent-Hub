/**
 * Minimal Playwright reporter that emits one NDJSON event per line to
 * stdout as the run progresses. The backend spawns `playwright test`
 * with this reporter and streams each parsed line to the browser over
 * SSE, which is what drives the live progress bar / log console in the
 * "Run Full Suite" modal.
 */
class StreamReporter {
  onBegin(_config, suite) {
    const total = suite.allTests().length;
    process.stdout.write(JSON.stringify({ type: 'begin', total }) + '\n');
  }

  onTestBegin(test) {
    process.stdout.write(
      JSON.stringify({
        type: 'test-begin',
        title: test.title,
        file: relFile(test.location.file),
        line: test.location.line,
      }) + '\n'
    );
  }

  onTestEnd(test, result) {
    process.stdout.write(
      JSON.stringify({
        type: 'test-end',
        title: test.title,
        file: relFile(test.location.file),
        line: test.location.line,
        status: result.status, // passed | failed | timedOut | skipped | interrupted
        duration: result.duration,
        error: result.error
          ? stripAnsi(String(result.error.message || result.error).split('\n')[0])
          : null,
        retry: result.retry,
      }) + '\n'
    );
  }

  onEnd(result) {
    process.stdout.write(JSON.stringify({ type: 'end', status: result.status }) + '\n');
  }
}

function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\[[0-9;]*m/g, '');
}

function relFile(file) {
  const idx = file.replace(/\\/g, '/').lastIndexOf('/tests/');
  return idx >= 0 ? file.replace(/\\/g, '/').slice(idx + 1) : file;
}

module.exports = StreamReporter;
