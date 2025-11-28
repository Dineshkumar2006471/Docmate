import cv2
import os

video_path = "Docmate Overview.mp4"
output_dir = "video_frames"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

fps = cap.get(cv2.CAP_PROP_FPS)
frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = frame_count / fps

print(f"Video Duration: {duration} seconds")

# Extract frames at 20%, 50%, and 80% of the video
timestamps = [duration * 0.2, duration * 0.5, duration * 0.8]

for i, ts in enumerate(timestamps):
    cap.set(cv2.CAP_PROP_POS_MSEC, ts * 1000)
    ret, frame = cap.read()
    if ret:
        filename = f"{output_dir}/frame_{i}.jpg"
        cv2.imwrite(filename, frame)
        print(f"Saved {filename}")
    else:
        print(f"Failed to extract frame at {ts}s")

cap.release()
