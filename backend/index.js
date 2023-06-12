const app = require('./src/app');
const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});