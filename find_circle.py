import sys
from PIL import Image

def find_circle(image_path):
    img = Image.open(image_path).convert("RGB")
    width, height = img.size
    
    min_x, max_x = width, 0
    min_y, max_y = height, 0
    
    # Sample a grid to find pure white or near-white pixels
    for y in range(0, height, 5):
        for x in range(0, width, 5):
            r, g, b = img.getpixel((x, y))
            if r > 240 and g > 240 and b > 240:
                # White pixel found
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y

    if max_x < min_x:
        print("No white circle found")
        return

    center_x = (min_x + max_x) // 2
    center_y = (min_y + max_y) // 2
    radius_x = (max_x - min_x) // 2
    radius_y = (max_y - min_y) // 2
    
    print(f"Center X: {center_x}")
    print(f"Center Y: {center_y}")
    print(f"Radius X: {radius_x}, Radius Y: {radius_y}")

find_circle("public/assets/bg-program-klub.png")
