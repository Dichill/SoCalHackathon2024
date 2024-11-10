import string
import time
import cv2
from flask import Flask, jsonify, request
from matplotlib import pyplot as plt
import numpy as np
import pyautogui
import easyocr
import Levenshtein

port = 3000
app = Flask(__name__)

img_path = "../temp/image.png"
reader = easyocr.Reader(["en"])


def levenshtein_similarity(sent1, sent2):
    distance = Levenshtein.distance(sent1, sent2)
    max_len = max(len(sent1), len(sent2))
    similarity = 1 - distance / max_len
    return similarity


def preprocess_sentence(sentence):
    # Convert to lowercase
    sentence = sentence.lower()
    # Remove punctuation
    translator = str.maketrans("", "", string.punctuation)
    sentence = sentence.translate(translator)
    # Optionally, strip extra whitespace
    sentence = sentence.strip()
    return sentence


def click_word(
    target_word,
    reader,
    confidence_threshold=0.5,
    delay_before_capture=5,
    delay_before_click=3,
    scaling_factor=2.0,
):
    """
    Captures the screen, detects the target word, and clicks on it.

    Parameters:
    - target_word (str): The word to search for and click.
    - confidence_threshold (float): Minimum confidence score to consider a detection valid.
    - delay_before_capture (int): Time in seconds to prepare the screen before capturing.
    - delay_before_click (int): Time in seconds before performing the click, allowing for any last-minute adjustments.
    - scaling_factor (float): The factor by which the screenshot resolution exceeds the screen resolution.
    """
    # Inform the user
    print(f"You have {delay_before_capture} seconds to prepare the screen...")
    time.sleep(delay_before_capture)

    # Capture the screenshot
    screenshot = pyautogui.screenshot()
    image_rgb = np.array(screenshot)

    # Initialize EasyOCR reader

    # Perform OCR
    results = reader.readtext(image_rgb)

    # Search for the target word
    target_bboxes = []
    for result in results:
        bbox, text, score = result
        processed1 = preprocess_sentence(text)
        processed2 = preprocess_sentence(target_word)
        similarity = levenshtein_similarity(processed1, processed2)

        if similarity >= confidence_threshold and score >= confidence_threshold:
            target_bboxes.append(bbox)

    if not target_bboxes:
        print(f"'{target_word}' not found with confidence >= {confidence_threshold}.")
        return

    # Iterate through all found instances of the target word
    for bbox in target_bboxes:
        # Calculate the center position in the screenshot's coordinate system
        x_coords = [point[0] for point in bbox]
        y_coords = [point[1] for point in bbox]
        center_x_screenshot = int(sum(x_coords) / len(x_coords))
        center_y_screenshot = int(sum(y_coords) / len(y_coords))

        print(
            f"Detected '{target_word}' at center: ({center_x_screenshot}, {center_y_screenshot}) in screenshot coordinates."
        )

        # Adjust the coordinates based on the scaling factor
        center_x_screen = int(center_x_screenshot / scaling_factor)
        center_y_screen = int(center_y_screenshot / scaling_factor)

        print(
            f"Adjusted click position: ({center_x_screen}, {center_y_screen}) on screen."
        )

    # Delay before clicking
    print(f"Clicking '{target_word}' in {delay_before_click} seconds...")
    time.sleep(delay_before_click)

    # Perform the click for each detected instance
    for bbox in target_bboxes:
        # Recalculate centers
        x_coords = [point[0] for point in bbox]
        y_coords = [point[1] for point in bbox]
        center_x_screenshot = int(sum(x_coords) / len(x_coords))
        center_y_screenshot = int(sum(y_coords) / len(y_coords))

        center_x_screen = int(center_x_screenshot / scaling_factor)
        center_y_screen = int(center_y_screenshot / scaling_factor)

        # Perform the click
        pyautogui.moveTo(x=center_x_screen, y=center_y_screen)
        pyautogui.click()
        pyautogui.click()
        print(f"Clicked on '{target_word}' at ({center_x_screen}, {center_y_screen})")


def shotScreen():
    im = pyautogui.screenshot()
    im.save(img_path)


@app.route("/analyze_screen", methods=["GET"])
def AnalyzeScreen():
    shotScreen()

    return jsonify(isSuccess=True)


@app.route("/click_request", methods=["POST"])
def ClickOnRequest():
    q = request.args.get("q")
    print("Request: " + q)

    click_word(
        target_word=q, reader=reader, delay_before_capture=0, delay_before_click=0
    )

    return jsonify(q=q, isSuccess=True)


@app.route("/open", methods=["POST"])
def newTab():
    pyautogui.keyDown("command")
    pyautogui.press("n")
    pyautogui.keyUp("command")

    return jsonify(isSuccess=True)


@app.route("/open_tab", methods=["POST"])
def OpenTab():
    pyautogui.hotkey("ctrl", "n")

    return jsonify(isSuccess=True)


@app.route("/navigate_page", methods=["POST"])
def navigate_page():
    try:
        data = request.get_json()
        if not data:
            return (
                jsonify({"isSuccess": False, "error": "No JSON payload provided."}),
                400,
            )

        zed = data.get("zed")

        if zed.lower() == "forward" or zed.lower() == "redo":
            pyautogui.keyDown("command")
            pyautogui.press("right")
            pyautogui.keyUp("command")
        elif zed.lower() == "backward" or zed.lower() == "back":
            pyautogui.keyDown("command")
            pyautogui.press("left")
            pyautogui.keyUp("command")

        return jsonify(isSuccess=True)

    except Exception as e:
        # Log the exception as needed
        return jsonify({"isSuccess": False, "error": str(e)}), 500


@app.route("/scroll", methods=["POST"])
def scroll_page():
    """
    Scroll the screen up or down based on the direction parameter.
    Expects a JSON payload with 'direction' and optionally 'amount'.
    Example:
    {
        "direction": "up",
        "amount": 100
    }
    """
    try:
        data = request.get_json()
        if not data:
            return (
                jsonify({"isSuccess": False, "error": "No JSON payload provided."}),
                400,
            )

        direction = data.get("direction")
        amount = data.get("amount", 100)

        if direction not in ["up", "down"]:
            return (
                jsonify(
                    {
                        "isSuccess": False,
                        "error": "Invalid direction. Use 'up' or 'down'.",
                    }
                ),
                400,
            )

        if not isinstance(amount, int):
            return (
                jsonify({"isSuccess": False, "error": "'amount' must be an integer."}),
                400,
            )

        # Perform the scroll
        if direction == "up":
            pyautogui.scroll(amount)
        else:
            pyautogui.scroll(-amount)

        return (
            jsonify({"isSuccess": True, "direction": direction, "amount": amount}),
            200,
        )

    except Exception as e:
        # Log the exception as needed
        return jsonify({"isSuccess": False, "error": str(e)}), 500


print("[Cain] Running on: http://localhost:" + str(port))
app.run(port=port)
