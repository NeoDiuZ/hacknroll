import asyncio
import websockets

# WebSocket server configuration
HOST = '0.0.0.0'  # Bind to all available interfaces
PORT = 8765       # Port to run the websocket server

# Key mapping adjusted for ESP32 commands
KEY_MAPPING = {
    "FORWARD": "W",    # ESP expects W
    "LEFT": "A",       # ESP expects A
    "BACKWARD": "S",   # ESP expects S
    "RIGHT": "D",      # ESP expects D
    "ATTACK": "Space"  # ESP expects Space
}

# Track connected clients
clients = set()

async def handle_client(websocket):
    try:
        # Add the new client to our set
        clients.add(websocket)
        print(f"Client connected. Total clients: {len(clients)}")
        
        async for message in websocket:
            # Handle the received key command
            print(f"Received command: {message}")
            
            # Get the corresponding ESP32 command
            esp_command = KEY_MAPPING.get(message)
            if esp_command:
                # Broadcast command to all ESP32 clients
                # This allows multiple UI clients to connect and one ESP32
                print(f"Sending command to ESP32: {esp_command}")
                for client in clients:
                    try:
                        await client.send(esp_command)
                    except websockets.exceptions.ConnectionClosed:
                        pass  # Client might have disconnected
            
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Remove the client from our set when they disconnect
        clients.remove(websocket)
        print(f"Client removed. Total clients: {len(clients)}")

async def main():
    print(f"WebSocket server starting on ws://{HOST}:{PORT}")
    async with websockets.serve(handle_client, HOST, PORT):
        print("WebSocket server is running...")
        await asyncio.Future()  # Keep running indefinitely

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}")