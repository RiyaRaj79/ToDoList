try {
  require('./app');
  console.log('✅ Server OK — all modules loaded');
  process.exit(0);
} catch (e) {
  console.error('❌ Error:', e.message);
  process.exit(1);
}
