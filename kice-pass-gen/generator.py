import os
import requests
from fpdf import FPDF

class KICEPDF(FPDF):
    def __init__(self, year="2025", period="제 1 교시", subject="국어 영역", exam_type="홀수형"):
        super().__init__(orientation='P', unit='mm', format=(255, 365))
        self.exam_year = year
        self.exam_period = period
        self.exam_subject = subject
        self.exam_type = exam_type
        
        self.nm_reg = "NanumMyeongjo-Regular.ttf"
        self.nm_bold = "NanumMyeongjo-Bold.ttf"
        
        self.fonts_dir = "C:\\Windows\\Fonts"
        self.font_map = {
            "Dinaru": os.path.join(self.fonts_dir, "H2DRRM.TTF"),
            "Gyeonmyeong": os.path.join(self.fonts_dir, "H2GMSM.TTF"),
            "Jungmyeong": os.path.join(self.fonts_dir, "H2MJSM.TTF"),
            "HanyangGyeon": os.path.join(self.fonts_dir, "HYGYM.TTF"),
            "TaeGothic": os.path.join(self.fonts_dir, "HYTGRB.TTF")
        }
        self.setup_fonts()
        self.alias_nb_pages()

    def set_word_spacing(self, spacing):
        if self.page > 0: self._out(f"BT {spacing:.2f} Tw ET")

    def setup_fonts(self):
        fonts = {
            self.nm_reg: "https://github.com/google/fonts/raw/main/ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf",
            self.nm_bold: "https://github.com/google/fonts/raw/main/ofl/nanummyeongjo/NanumMyeongjo-Bold.ttf"
        }
        for name, url in fonts.items():
            if not os.path.exists(name):
                try:
                    r = requests.get(url, timeout=10)
                    if r.status_code == 200:
                        with open(name, 'wb') as f: f.write(r.content)
                except: pass

        configs = [
            ("KICE_Dinaru", "Dinaru", self.nm_bold),
            ("KICE_Gyeonmyeong", "Gyeonmyeong", self.nm_bold),
            ("KICE_Jungmyeong", "Jungmyeong", self.nm_reg),
            ("KICE_HYGyeon", "HanyangGyeon", self.nm_bold),
            ("KICE_TaeGothic", "TaeGothic", self.nm_bold)
        ]

        for font_name, map_key, fallback in configs:
            path = self.font_map.get(map_key)
            registered = False
            if path and os.path.exists(path):
                try:
                    self.add_font(font_name, "", path)
                    registered = True
                except: pass
            if not registered and os.path.exists(fallback):
                self.add_font(font_name, "", fallback)

    def header(self): pass

    def footer(self):
        self.set_y(-15)
        self.set_font("KICE_Gyeonmyeong", "", 11.4)
        self.set_char_spacing(-0.1)
        self.cell(0, 10, f"- {self.page_no()} -", align='C')
        self.set_char_spacing(0)

    def render_csat_header(self):
        mid_x = 127.5
        self.set_xy(15, 15)
        self.set_font("KICE_HYGyeon", "", 17.6)
        self.set_char_spacing(2)
        self.cell(45, 12, self.exam_period, border=1, align='C')
        self.set_char_spacing(0)
        
        self.set_xy(0, 18)
        self.set_font("KICE_Dinaru", "", 17.85)
        self.cell(255, 10, f"{self.exam_year}학년도 대학수학능력시험 모의평가 문제지", align='C', new_x="LMARGIN", new_y="NEXT")
        
        self.set_xy(225, 15)
        self.set_font("KICE_Gyeonmyeong", "", 29.7)
        self.cell(20, 20, f"{self.page_no()}", align='R')
        
        self.set_xy(0, 32)
        self.set_font("KICE_Dinaru", "", 32)
        self.set_char_spacing(10)
        self.cell(255, 15, self.exam_subject, align='C', new_x="LMARGIN", new_y="NEXT")
        self.set_char_spacing(0)
        
        self.set_xy(215, 35)
        self.set_font("KICE_TaeGothic", "", 14.25)
        self.rect(215, 35, 25, 12, 'D')
        self.set_xy(215, 38.5)
        self.cell(25, 5, self.exam_type, align='C')
        
        self.set_line_width(0.6)
        self.line(15, 52, 240, 52)
        self.set_line_width(0.3)
        self.line(15, 53.5, 240, 53.5)
        self.line(mid_x, 53.5, mid_x, 350)
        self.set_y(60)

    def add_passage(self, content, is_first=False):
        # Disable auto page break during passage rendering
        original_auto_break = self.auto_page_break
        original_margin = self.b_margin
        self.set_auto_page_break(False)
        
        # FIX 1: Only add page if necessary
        if self.page == 0: 
            self.add_page()
            if is_first: self.render_csat_header()
        elif self.get_y() > 300: # If near bottom, start new page
            self.add_page()
            # If not the very first page of the whole PDF, we still might want a divider or spacing
            self.render_csat_header() # Re-render header on each page for consistency

        mid_x = 127.5
        margin_x = 15
        gap = 5
        box_padding = 1.7
        
        col_width = (mid_x - gap) - margin_x
        text_width = col_width - (box_padding * 2)
        
        body_font_size = 10.91
        line_height = (body_font_size * 0.3527) * 1.6
        self.set_font("KICE_Jungmyeong", "", body_font_size)
        self.set_char_spacing(-0.2)
        self.set_word_spacing(-0.35)
        # Normalize content: 
        # 1. Standardize newlines
        content = content.replace('\r\n', '\n')
        # 2. Treat every single \n as a true paragraph break (indented)
        paragraphs = [p.strip() for p in content.split('\n') if p.strip()]
        
        # Re-derive full content string for length check
        normalized_content = "\n".join(paragraphs)
        
        # --- STRICT 1,200 CHAR SPLIT LOGIC ---
        col1_content = []
        col2_content = []
        
        # Track if the first item of col2 is a continuation of a split paragraph
        col2_is_continuation = False
        
        if len(normalized_content) < 1200:
            col1_content = paragraphs
        else:
            if len(paragraphs) == 1:
                # Split single large paragraph by lines reaching ~1,200 chars
                lines = self.multi_cell(text_width, line_height, " " + paragraphs[0], align='J', dry_run=True, output="LINES", wrapmode="CHAR")
                acc_chars = 0
                split_idx = len(lines)
                for i, line in enumerate(lines):
                    acc_chars += len(line)
                    if acc_chars >= 1200:
                        split_idx = i + 1
                        break
                
                col1_content = ["\n".join(lines[:split_idx])]
                remaining_lines = lines[split_idx:]
                if remaining_lines:
                    col2_content = ["\n".join(remaining_lines)]
                    col2_is_continuation = True
            else:
                # Multiple paragraphs: Split exactly at 1,200 chars, even mid-paragraph
                total_chars = 0
                split_done = False
                for p in paragraphs:
                    if split_done:
                        col2_content.append(p)
                        continue
                    
                    para_len = len(p)
                    if total_chars + para_len < 1200:
                        col1_content.append(p)
                        total_chars += para_len
                    else:
                        # This paragraph crosses the 1,200 mark. Split it.
                        lines = self.multi_cell(text_width, line_height, " " + p, align='J', dry_run=True, output="LINES", wrapmode="CHAR")
                        acc_chars_in_p = 0
                        split_idx = len(lines)
                        needed = 1200 - total_chars
                        
                        for i, line in enumerate(lines):
                            acc_chars_in_p += len(line)
                            if acc_chars_in_p >= needed:
                                split_idx = i + 1
                                break
                        
                        # Part 1 stays in col 1
                        p1_text = "\n".join(lines[:split_idx]).strip()
                        if p1_text: col1_content.append(p1_text)
                        
                        # Part 2 (rest of this paragraph) starts col 2
                        remaining_p = "\n".join(lines[split_idx:]).strip()
                        if remaining_p:
                            col2_content.append(remaining_p)
                            col2_is_continuation = True
                        split_done = True

        start_y = self.get_y()

        def render_col(content_list, x_start, is_col2=False):
            if not content_list: return 0
            
            # Predict
            text_h = 0
            for i, item in enumerate(content_list):
                is_cont = (is_col2 and i == 0 and col2_is_continuation)
                prefix = "" if (is_cont or item.startswith("\n")) else " "
                lines = self.multi_cell(text_width, line_height, prefix + item, align='J', dry_run=True, output="LINES", wrapmode="CHAR")
                text_h += len(lines) * line_height + 2
            
            box_h = text_h + (box_padding * 2)
            self.set_line_width(0.3)
            self.rect(x_start, start_y, col_width, box_h)
            
            ty = start_y + box_padding
            tx = x_start + box_padding
            for i, item in enumerate(content_list):
                self.set_xy(tx, ty)
                is_cont = (is_col2 and i == 0 and col2_is_continuation)
                prefix = "" if (is_cont or item.startswith("\n")) else " "
                self.multi_cell(text_width, line_height, prefix + item, align='J', wrapmode="CHAR")
                ty = self.get_y() + 2
            return box_h

        h1 = render_col(col1_content, margin_x)
        h2 = render_col(col2_content, mid_x + gap, is_col2=True)
        
        self.set_char_spacing(0)
        self.set_word_spacing(0)
        self.set_y(start_y + max(h1, h2) + 15)
        self.set_auto_page_break(original_auto_break, original_margin)

    def save(self, path): self.output(path)

if __name__ == "__main__":
    t_long = "모모스커피의 비약적인 발전 배경을 이해하기 위해서는 창업 초기부터 브랜드의 근저에 깔려 있는 철학적 배경과 인적 결합의 시너지를 분석해야 한다. " * 10
    pdf = KICEPDF()
    # Test multiple passages on one page
    pdf.add_passage(t_long, is_first=True)
    pdf.add_passage("이것은 같은 페이지의 공간을 활용하는 두 번째 지문입니다.", is_first=False)
    pdf.save("final_page_sharing_split.pdf")
    print("Page-sharing and Split PDF generated.")
