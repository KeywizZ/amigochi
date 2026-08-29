// PocketBase JS Hook — runs in PocketBase's built-in JS VM
// See: https://pocketbase.io/docs/js-overview/

onRecordAfterAuthRequestSuccess((e) => {
  console.log(`User authenticated: ${e.record.getString("email")}`);
});
