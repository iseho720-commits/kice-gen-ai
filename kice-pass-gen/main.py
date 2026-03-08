import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QLineEdit, QTextEdit, 
                             QPushButton, QFileDialog, QMessageBox, QListWidget, QGroupBox)
from PyQt6.QtCore import Qt
from generator import KICEPDF

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("KICE-style PDF Generator (Multi-Passage)")
        self.setMinimumSize(800, 700)
        self.passages = []
        self.init_ui()

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)

        # Left Panel: Input Form
        input_panel = QVBoxLayout()
        input_panel.addWidget(QLabel("<h2>1. 시험 정보 설정</h2>"))
        
        meta_grid = QHBoxLayout()
        
        v1 = QVBoxLayout()
        v1.addWidget(QLabel("학년도 (Year):"))
        self.year_input = QLineEdit("2025")
        v1.addWidget(self.year_input)
        
        v2 = QVBoxLayout()
        v2.addWidget(QLabel("교시 (Period):"))
        self.period_input = QLineEdit("제 1 교시")
        v2.addWidget(self.period_input)
        
        v3 = QVBoxLayout()
        v3.addWidget(QLabel("영역 (Subject):"))
        self.subject_input = QLineEdit("국어 영역")
        v3.addWidget(self.subject_input)
        
        v4 = QVBoxLayout()
        v4.addWidget(QLabel("유형 (Type):"))
        self.type_input = QLineEdit("홀수형")
        v4.addWidget(self.type_input)
        
        meta_grid.addLayout(v1)
        meta_grid.addLayout(v2)
        meta_grid.addLayout(v3)
        meta_grid.addLayout(v4)
        input_panel.addLayout(meta_grid)

        input_panel.addSpacing(10)
        input_panel.addWidget(QLabel("<h2>2. 지문 입력</h2>"))

        input_panel.addWidget(QLabel("지문 내용 (Content):"))
        self.content_input = QTextEdit()
        self.content_input.setPlaceholderText("지문 내용을 입력하세요. 엔터 1번마다 새로운 문단(들여쓰기)이 시작됩니다.")
        input_panel.addWidget(self.content_input)

        self.add_btn = QPushButton("목록에 추가")
        self.add_btn.setStyleSheet("background-color: #3498db; color: white; font-weight: bold; padding: 10px;")
        self.add_btn.clicked.connect(self.add_passage_to_list)
        input_panel.addWidget(self.add_btn)
        
        main_layout.addLayout(input_panel, 3)

        # Right Panel: List Management
        list_panel = QVBoxLayout()
        list_panel.addWidget(QLabel("<h2>지문 목록</h2>"))
        
        self.list_widget = QListWidget()
        list_panel.addWidget(self.list_widget)

        btn_layout = QHBoxLayout()
        self.del_btn = QPushButton("선택 삭제")
        self.del_btn.clicked.connect(self.delete_selected)
        btn_layout.addWidget(self.del_btn)

        self.clear_btn = QPushButton("모두 비우기")
        self.clear_btn.clicked.connect(self.clear_list)
        btn_layout.addWidget(self.clear_btn)
        list_panel.addLayout(btn_layout)

        list_panel.addSpacing(20)
        
        self.generate_btn = QPushButton("전체 PDF 생성")
        self.generate_btn.setStyleSheet("""
            QPushButton {
                background-color: #2c3e50;
                color: white;
                font-weight: bold;
                font-size: 16px;
                padding: 15px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #34495e;
            }
        """)
        self.generate_btn.clicked.connect(self.generate_pdf)
        list_panel.addWidget(self.generate_btn)
        
        main_layout.addLayout(list_panel, 2)

    def add_passage_to_list(self):
        content = self.content_input.toPlainText().strip()

        if not content:
            QMessageBox.warning(self, "입력 오류", "지문 내용을 입력해주세요.")
            return

        self.passages.append(content)
        # Display a snippet of the content in the list
        snippet = content[:30].replace("\n", " ") + "..." if len(content) > 30 else content
        self.list_widget.addItem(f"지문: {snippet}")
        
        # Clear inputs
        self.content_input.clear()

    def delete_selected(self):
        current_row = self.list_widget.currentRow()
        if current_row >= 0:
            self.passages.pop(current_row)
            self.list_widget.takeItem(current_row)

    def clear_list(self):
        self.passages = []
        self.list_widget.clear()

    def generate_pdf(self):
        if not self.passages:
            QMessageBox.warning(self, "목록 비어 있음", "먼저 지문을 추가해 주세요.")
            return

        file_path, _ = QFileDialog.getSaveFileName(
            self, "PDF 저장", "KICE_Passages.pdf", "PDF Files (*.pdf)"
        )

        if file_path:
            try:
                # Get meta from UI
                year = self.year_input.text().strip()
                period = self.period_input.text().strip()
                subject = self.subject_input.text().strip()
                etype = self.type_input.text().strip()

                pdf = KICEPDF(year=year, period=period, subject=subject, exam_type=etype)
                for i, content in enumerate(self.passages):
                    pdf.add_passage(content, is_first=(i==0))
                pdf.save(file_path)
                QMessageBox.information(self, "성공", f"PDF가 성공적으로 생성되었습니다.\n{file_path}")
            except Exception as e:
                QMessageBox.critical(self, "오류", f"PDF 생성 중 오류가 발생했습니다: {str(e)}")

def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
