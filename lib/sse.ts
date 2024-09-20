// lib/sse.ts

let clients: ReadableStreamDefaultController[] = [];

export function sendToClients(newData: any) {
  clients.forEach((client) => {
    const message = `data: ${JSON.stringify(newData)}\n\n`;
    client.enqueue(new TextEncoder().encode(message));
  });
}

export function addClient(client: ReadableStreamDefaultController) {
  clients.push(client);
}

export function removeClient(client: ReadableStreamDefaultController) {
  clients = clients.filter(c => c !== client);
}