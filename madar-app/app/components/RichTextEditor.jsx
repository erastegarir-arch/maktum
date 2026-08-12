'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css'; // نام استایل هم تغییر کرد

// اینجا هم import به react-quill-new تغییر کرد
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function RichTextEditor({ value, onChange, placeholder = "متن خود را اینجا بنویسید..." }) {
  
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'direction': 'rtl' }, { 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }), []);

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#06b6d4] transition-colors">
      <ReactQuill 
        theme="snow" 
        value={value || ''} 
        onChange={onChange} 
        modules={modules}
        placeholder={placeholder}
        className="text-white dir-rtl"
      />
      
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          background: rgba(0,0,0,0.2) !important;
        }
        .ql-container.ql-snow {
          border: none !important;
          min-height: 200px;
          font-family: inherit !important;
          font-size: 14px;
        }
        .ql-editor { text-align: right; direction: rtl; }
        .ql-snow .ql-stroke { stroke: #9ca3af !important; }
        .ql-snow .ql-fill { fill: #9ca3af !important; }
        .ql-snow .ql-picker { color: #9ca3af !important; }
      `}</style>
    </div>
  );
}