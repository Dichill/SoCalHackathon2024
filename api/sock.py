import sys
import json
import struct


def send_message(message):
    # Encode the message as JSON
    encoded_message = json.dumps(message).encode("utf-8")
    # Prefix the message with its length in bytes
    sys.stdout.buffer.write(struct.pack("I", len(encoded_message)))
    sys.stdout.buffer.write(encoded_message)
    sys.stdout.flush()


def main():
    # Example message to open a new tab
    message = {"command": "openTab", "url": "https://www.example.com"}
    send_message(message)


if __name__ == "__main__":
    main()
