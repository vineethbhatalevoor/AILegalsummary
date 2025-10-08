import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document
import google.generativeai as genai
from google.generativeai import types

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(filepath):
    text = ""
    try:
        with open(filepath, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text
    except Exception as e:
        raise Exception(f"Error extracting PDF: {str(e)}")
    return text

def extract_text_from_docx(filepath):
    try:
        doc = Document(filepath)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    except Exception as e:
        raise Exception(f"Error extracting DOCX: {str(e)}")
    return text

def extract_text_from_txt(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            text = file.read()
    except Exception as e:
        raise Exception(f"Error extracting TXT: {str(e)}")
    return text

def summarize_with_gemini(text, language):
    language_prompts = {
        'english': 'English',
        'hindi': 'Hindi',
        'kannada': 'Kannada'
    }

    lang_name = language_prompts.get(language, 'English')

    system_instruction = f"""You are an expert legal document analyst. Your task is to summarize legal documents in {lang_name}.

Instructions:
1. Provide a clear, concise summary of the document
2. Highlight key legal points, clauses, and obligations
3. Identify important parties, dates, and terms
4. Maintain professional legal terminology
5. Structure the summary with clear sections
6. Respond entirely in {lang_name}"""

    full_prompt = f"""{system_instruction}

Please provide a comprehensive legal summary of the following document in clean HTML format with proper headings, bold labels, and bullet points:
:

{text}
"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash-exp")

        response = model.generate_content(
            full_prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
            )
        )
        return response.text
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize():
    filepath = None
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    language = request.form.get('language', 'english').lower()
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, or TXT file'}), 400
    
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        if file_ext == 'pdf':
            text = extract_text_from_pdf(filepath)
        elif file_ext == 'docx':
            text = extract_text_from_docx(filepath)
        elif file_ext == 'txt':
            text = extract_text_from_txt(filepath)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
        
        if not text or len(text.strip()) < 10:
            return jsonify({'error': 'Could not extract meaningful text from the document'}), 400
        
        summary = summarize_with_gemini(text, language)
        
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'summary': summary,
            'filename': filename
        })
    
    except Exception as e:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
