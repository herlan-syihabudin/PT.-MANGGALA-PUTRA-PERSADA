export async function GET() {
  return new Response("event: message\ndata: connected\n\n", {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
