import os
import math
from PIL import Image, ImageDraw, ImageFont

def generate_toollab_og_image(output_path=r"D:\Gemini_Files\ToolLab.org\og-image.png"):
    width, height = 1200, 630
    
    # 1. Base Slate-950 Canvas
    base_bg = (11, 15, 25)
    img = Image.new("RGBA", (width, height), (*base_bg, 255))
    
    # 2. Smooth Radial Glow (Emerald Aurora) using pure pixel buffer
    glow_overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_overlay)
    
    center_x, center_y = 600, 210
    radius_x, radius_y = 420, 200
    
    for r in range(100, 0, -2):
        factor = r / 100.0
        cur_rx = int(radius_x * factor)
        cur_ry = int(radius_y * factor)
        alpha = int(45 * (1.0 - factor))
        glow_draw.ellipse(
            [center_x - cur_rx, center_y - cur_ry, center_x + cur_rx, center_y + cur_ry],
            fill=(16, 185, 129, alpha)
        )
    
    img = Image.alpha_composite(img, glow_overlay)
    draw = ImageDraw.Draw(img)
    
    # Outer Tech Frame
    draw.rounded_rectangle([24, 24, width - 24, height - 24], radius=24, outline=(30, 41, 59, 255), width=2)
    
    # 3. Logo Box Container
    box_w, box_h = 104, 104
    box_x = (width - box_w) // 2
    box_y = 90
    
    draw.rounded_rectangle(
        [box_x, box_y, box_x + box_w, box_y + box_h],
        radius=26,
        fill=(15, 23, 42, 255),
        outline=(51, 65, 85, 255),
        width=2
    )
    
    # Vector Flask Lines
    scale = box_w / 36.0
    def pt(x, y):
        return (int(box_x + x * scale), int(box_y + y * scale))

    flask_color = (52, 211, 153, 255)
    thick = int(2.2 * scale)
    
    # Rim & Neck & Body
    draw.line([pt(15, 9), pt(21, 9)], fill=flask_color, width=thick)
    draw.line([pt(16.5, 9), pt(16.5, 14.5)], fill=flask_color, width=thick)
    draw.line([pt(16.5, 14.5), pt(11, 23.5)], fill=flask_color, width=thick)
    draw.line([pt(11, 23.5), pt(13.5, 27.5)], fill=flask_color, width=thick)
    draw.line([pt(13.5, 27.5), pt(22.5, 27.5)], fill=flask_color, width=thick)
    draw.line([pt(22.5, 27.5), pt(25, 23.5)], fill=flask_color, width=thick)
    draw.line([pt(25, 23.5), pt(19.5, 14.5)], fill=flask_color, width=thick)
    draw.line([pt(19.5, 14.5), pt(19.5, 9)], fill=flask_color, width=thick)

    # Core Sparkle
    c1 = pt(18, 20)
    draw.ellipse([c1[0]-4, c1[1]-4, c1[0]+4, c1[1]+4], fill=(167, 243, 208, 255))
    
    # 4. Typography (Fallback Safe)
    font_paths = [
        r"C:\Windows\Fonts\malgunbd.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\segoeui.ttf"
    ]
    
    font_bold_path = next((p for p in font_paths if os.path.exists(p)), None)
    
    if font_bold_path:
        f_brand = ImageFont.truetype(font_bold_path, 60)
        f_ext = ImageFont.truetype(font_bold_path, 36)
        f_title = ImageFont.truetype(font_bold_path, 34)
        f_sub = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf" if os.path.exists(r"C:\Windows\Fonts\arial.ttf") else font_bold_path, 20)
        f_badge = ImageFont.truetype(font_bold_path, 16)
    else:
        f_brand = f_ext = f_title = f_sub = f_badge = ImageFont.load_default()

    # Brand Title: ToolLab.org
    y_brand = 225
    b_tool = draw.textbbox((0, 0), "Tool", font=f_brand)
    b_lab = draw.textbbox((0, 0), "Lab", font=f_brand)
    b_org = draw.textbbox((0, 0), ".org", font=f_ext)
    
    w_tool = b_tool[2] - b_tool[0]
    w_lab = b_lab[2] - b_lab[0]
    w_org = b_org[2] - b_org[0]
    
    spacing = 6
    total_w = w_tool + spacing + w_lab + spacing + w_org
    start_x = (width - total_w) // 2
    
    draw.text((start_x, y_brand), "Tool", fill=(241, 245, 249, 255), font=f_brand)
    draw.text((start_x + w_tool + spacing, y_brand), "Lab", fill=(52, 211, 153, 255), font=f_brand)
    draw.text((start_x + w_tool + spacing + w_lab + spacing, y_brand + 20), ".org", fill=(16, 185, 129, 255), font=f_ext)

    # Main Headline
    headline = "Free Ultra-Fast Client-Side Micro Utilities"
    b_head = draw.textbbox((0, 0), headline, font=f_title)
    draw.text(((width - (b_head[2] - b_head[0])) // 2, 325), headline, fill=(248, 250, 252, 255), font=f_title)

    # Subtitle
    sub = "Zero Server Uploads  ·  100% In-Browser Memory  ·  Zero Logins"
    b_sub = draw.textbbox((0, 0), sub, font=f_sub)
    draw.text(((width - (b_sub[2] - b_sub[0])) // 2, 385), sub, fill=(148, 163, 184, 255), font=f_sub)

    # 5. Clean Feature Badges (깨지는 이모지 완전 제거)
    badges = ["ZERO SERVER COST", "100% PRIVATE SANDBOX", "WASM & CANVAS ENGINE"]
    badge_y = 470
    badge_widths = []
    
    for b in badges:
        bb = draw.textbbox((0, 0), b, font=f_badge)
        badge_widths.append((bb[2] - bb[0]) + 40)
        
    gap = 20
    total_badges_w = sum(badge_widths) + gap * (len(badges) - 1)
    bx = (width - total_badges_w) // 2
    
    for i, b in enumerate(badges):
        bw = badge_widths[i]
        draw.rounded_rectangle(
            [bx, badge_y, bx + bw, badge_y + 44],
            radius=12,
            fill=(15, 23, 42, 255),
            outline=(30, 41, 59, 255),
            width=2
        )
        # Small Status Dot
        draw.ellipse([bx + 14, badge_y + 19, bx + 20, badge_y + 25], fill=(52, 211, 153, 255))
        
        bb = draw.textbbox((0, 0), b, font=f_badge)
        draw.text((bx + 28, badge_y + 13), b, fill=(203, 213, 225, 255), font=f_badge)
        bx += bw + gap

    # Final Save
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    img.convert("RGB").save(output_path, "PNG", optimize=True)
    print(f"\n[성공] 깔끔한 OG 이미지 생성 완료: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    generate_toollab_og_image()