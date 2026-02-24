import { createServer } from "http";

function bootstrap() {
  createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello, world!" }));
  }).listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}
void bootstrap();
