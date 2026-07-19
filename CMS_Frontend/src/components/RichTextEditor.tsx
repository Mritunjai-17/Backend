import { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Bold,
  Italic,
  Underline,
  Heading,
  Paragraph,
  FontColor,
  FontBackgroundColor,
  FontSize,
  Alignment,
  List,
  ListProperties,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  Link,
  BlockQuote,
  CodeBlock,
  HorizontalLine,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageUpload,
  ImageResize,
  PasteFromOffice,
  Undo
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import { API_BASE_URL } from '../services/api';

// Custom Upload Adapter Class for Image Uploads
class MyUploadAdapter {
  private loader: any;
  private onUploadStart: () => void;
  private onUploadEnd: () => void;
  private xhr?: XMLHttpRequest;

  constructor(loader: any, onUploadStart: () => void, onUploadEnd: () => void) {
    this.loader = loader;
    this.onUploadStart = onUploadStart;
    this.onUploadEnd = onUploadEnd;
  }

  upload() {
    this.onUploadStart();
    return this.loader.file.then((file: File) => new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/upload`, true);
      xhr.withCredentials = true; // Crucial for HTTP-only session cookies

      // Track progress
      if (xhr.upload) {
        xhr.upload.addEventListener('progress', (evt) => {
          if (evt.lengthComputable) {
            this.loader.uploadTotal = evt.total;
            this.loader.uploaded = evt.loaded;
          }
        });
      }

      // Handle server responses
      xhr.addEventListener('load', () => {
        this.onUploadEnd();
        const response = xhr.response;
        if (!response || xhr.status < 200 || xhr.status >= 300) {
          return reject(response && response.message ? response.message : `Upload failed with status ${xhr.status}`);
        }
        
        try {
          const result = JSON.parse(response);
          if (result.success && result.url) {
            resolve({
              default: result.url
            });
          } else {
            reject(result.message || 'Failed to parse image URL from server');
          }
        } catch (e) {
          reject('Invalid JSON response from server');
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        this.onUploadEnd();
        reject('Network error during upload');
      });

      xhr.addEventListener('abort', () => {
        this.onUploadEnd();
        reject('Upload aborted by user');
      });

      // Prepare request data
      const data = new FormData();
      data.append('upload', file);
      xhr.send(data);
      this.xhr = xhr;
    }));
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }
}

interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  onUploadingChange,
  placeholder = 'Write your article details here...',
  disabled = false
}: RichTextEditorProps) {
  const [activeUploads, setActiveUploads] = useState(0);

  const handleUploadStart = () => {
    setActiveUploads((prev) => {
      const next = prev + 1;
      if (onUploadingChange) onUploadingChange(true);
      return next;
    });
  };

  const handleUploadEnd = () => {
    setActiveUploads((prev) => {
      const next = Math.max(0, prev - 1);
      if (onUploadingChange) onUploadingChange(next > 0);
      return next;
    });
  };

  function customUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return new MyUploadAdapter(loader, handleUploadStart, handleUploadEnd);
    };
  }

  const editorConfiguration: any = {
    licenseKey: 'GPL' as const,
    plugins: [
      Essentials,
      Bold,
      Italic,
      Underline,
      Heading,
      Paragraph,
      FontColor,
      FontBackgroundColor,
      FontSize,
      Alignment,
      List,
      ListProperties,
      Table,
      TableToolbar,
      TableProperties,
      TableCellProperties,
      Link,
      BlockQuote,
      CodeBlock,
      HorizontalLine,
      Image,
      ImageToolbar,
      ImageCaption,
      ImageStyle,
      ImageUpload,
      ImageResize,
      PasteFromOffice,
      Undo
    ],
    toolbar: {
      items: [
        'undo', 'redo',
        '|',
        'heading',
        '|',
        'bold', 'italic', 'underline',
        '|',
        'uploadImage', 'link',
        '|',
        'fontSize', 'fontColor', 'fontBackgroundColor',
        '|',
        'alignment',
        '|',
        'numberedList', 'bulletedList',
        '|',
        'insertTable', 'blockQuote', 'codeBlock', 'horizontalLine'
      ]
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
      ]
    },
    fontSize: {
      options: [
        9, 11, 13, 'default', 17, 19, 21, 26, 30
      ]
    },
    image: {
      toolbar: [
        'imageStyle:inline', 'imageStyle:block', 'imageStyle:side',
        '|',
        'toggleImageCaption', 'imageTextAlternative',
        '|',
        'resizeImage'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn', 'tableRow', 'mergeTableCells',
        '|',
        'tableProperties', 'tableCellProperties'
      ]
    },
    placeholder: placeholder,
    extraPlugins: [customUploadAdapterPlugin]
  };

  return (
    <div className={`rich-text-editor-container ${activeUploads > 0 ? 'uploading' : ''}`}>
      {activeUploads > 0 && (
        <div style={styles.uploadOverlay}>
          <span style={styles.uploadText}>Uploading image(s) to server...</span>
        </div>
      )}
      <CKEditor
        editor={ClassicEditor}
        config={editorConfiguration}
        data={value}
        disabled={disabled}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}

const styles = {
  uploadOverlay: {
    padding: '0.5rem 1rem',
    background: 'var(--success-glow)',
    border: '1px solid var(--success)',
    borderRadius: 'var(--border-radius-sm)',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem'
  },
  uploadText: {
    color: 'var(--success)',
    fontWeight: 500
  }
};
