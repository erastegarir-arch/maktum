'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

// === اکستنشن‌های جدید اضافه شده ===
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image'; // افزونه تصویر

// ================= کامپوننت داخلی برای آیکون‌های ادیتور =================
const EditorIcon = ({ name, className = "w-4 h-4" }) => {
  const icons = {
    bold: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      </svg>
    ),
    italic: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
      </svg>
    ),
    underline: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" y1="20" x2="20" y2="20" />
      </svg>
    ),
    strike: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" />
      </svg>
    ),
    link: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    highlight: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
      </svg>
    ),
    textColor: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16" /><path d="m15 16-3-8-3 8" /><path d="m10 13h4" />
      </svg>
    ),
    superscript: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19L11 10" /><path d="M4 10L11 19" /><path d="M17 8c0-1.1.9-2 2-2s2 .9 2 2c0 2-4 2-4 4.5h5" />
      </svg>
    ),
    subscript: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14L11 5" /><path d="M4 5L11 14" /><path d="M17 15c0-1.1.9-2 2-2s2 .9 2 2c0 2-4 2-4 4.5h5" />
      </svg>
    ),
    h2: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
      </svg>
    ),
    h3: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" /><path d="M17 17.5c2 1.5 4 0 4-1.5a2 2 0 0 0-2-2" />
      </svg>
    ),
    directionRtl: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 15h8c2.21 0 4-1.79 4-4s-1.79-4-4-4H5l4 4m-4-4 4-4"/>
      </svg>
    ),
    directionLtr: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 15H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h13l-4 4m4-4-4-4"/>
      </svg>
    ),
    alignRight: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="12" x2="9" y2="12" /><line x1="21" y1="18" x2="7" y2="18" />
      </svg>
    ),
    alignCenter: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="6" /><line x1="21" y1="12" x2="3" y2="12" /><line x1="18" y1="18" x2="6" y2="18" />
      </svg>
    ),
    alignLeft: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="21" y1="6" x2="3" y2="6" /><line x1="15" y1="12" x2="3" y2="12" /><line x1="17" y1="18" x2="3" y2="18" />
      </svg>
    ),
    alignJustify: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    listBullets: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="2" fill="currentColor" /><circle cx="4" cy="12" r="2" fill="currentColor" /><circle cx="4" cy="18" r="2" fill="currentColor" />
      </svg>
    ),
    listNumbers: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h2v4H4" /><path d="M4 14h3v4H4" />
      </svg>
    ),
    textBlockquote: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
    ),
    media: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  };

  return icons[name] || null;
};

const TextDirectionExtension = Extension.create({
  name: 'textDirection',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote', 'orderedList', 'bulletList', 'listItem'],
        attributes: {
          dir: {
            default: null,
            parseHTML: element => element.getAttribute('dir'),
            renderHTML: attributes => {
              if (!attributes.dir) return {};
              return { dir: attributes.dir };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setDirection: (dir) => ({ chain }) => {
        return chain()
          .updateAttributes('paragraph', { dir })
          .updateAttributes('heading', { dir })
          .updateAttributes('blockquote', { dir })
          .updateAttributes('orderedList', { dir })
          .updateAttributes('bulletList', { dir })
          .updateAttributes('listItem', { dir })
          .run();
      },
    };
  },
});

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "متن خود را اینجا بنویسید...",
  activeTheme = { bg: 'bg-[#06b6d4]', text: 'text-[#06b6d4]' }, 
  onOpenMedia 
}) {
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextAlign.configure({ 
        types: ['heading', 'paragraph', 'blockquote', 'listItem', 'orderedList', 'bulletList'], 
        alignments: ['left', 'center', 'right', 'justify'] 
      }),
      TextDirectionExtension,
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      // === افزونه پردازش تصویر اضافه شد ===
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image rounded-2xl max-w-full h-auto my-4 border border-white/10 shadow-lg',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[300px] outline-none text-sm leading-loose font-light p-5 text-gray-200 font-sans focus:outline-none',
        dir: 'rtl' 
      }
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const currentDir = editor.isActive({ dir: 'ltr' }) ? 'ltr' : 'rtl';
  const isRtl = currentDir === 'rtl';
  const isLtr = currentDir === 'ltr';

  const ToolbarButton = ({ onClick, isActive, children, title, className = "" }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`relative min-w-[34px] h-[34px] px-2 rounded-xl transition-all duration-200 flex items-center justify-center font-sans text-xs cursor-pointer border ${className} ${
        isActive 
          ? `${activeTheme.bg} text-white border-white/20 shadow-md scale-105 font-bold` 
          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/10'
      }`}
    >
      {children}
    </button>
  );

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('آدرس لینک (URL) را وارد کنید:', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="w-full bg-[#080c16] border border-white/10 rounded-2xl focus-within:border-white/30 transition-all shadow-2xl flex flex-col font-sans relative GKEditorWrp">
      
      {/* نوار ابزار چسبان */}
      <div className="sticky -top-8 z-40 bg-[#0b0f19]/95 backdrop-blur-xl border-b border-white/10 p-2.5 flex flex-wrap gap-1.5 items-center shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] rounded-t-2xl GKEditorToolbar">
        
        {/* ۱. فرمت‌های پایه متن */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="بولد (ضخیم)">
          <EditorIcon name="bold"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="ایتالیک (مورب)">
          <EditorIcon name="italic"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="خط زیر متن">
          <EditorIcon name="underline"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="خط‌خورده">
          <EditorIcon name="strike"/>
        </ToolbarButton>

        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="افزودن / ویرایش لینک">
          <EditorIcon name="link"/>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1.5"></div>

        {/* ۲. رنگ و هایلایت متن */}
        <div className="relative group flex" title="رنگ متن">
          <ToolbarButton isActive={editor.isActive('textStyle')}>
            <EditorIcon name="textColor"/>
            <input 
              type="color" 
              onInput={event => editor.chain().focus().setColor(event.target.value).run()} 
              value={editor.getAttributes('textStyle').color || '#ffffff'} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="absolute bottom-1.5 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#ffffff' }}></div>
          </ToolbarButton>
        </div>

        <div className="relative group flex" title="هایلایت (پس‌زمینه متن)">
          <ToolbarButton isActive={editor.isActive('highlight')}>
            <EditorIcon name="highlight"/>
            <input 
              type="color" 
              onInput={event => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()} 
              value={editor.getAttributes('highlight').color || '#fbbf24'} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="absolute bottom-1.5 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: editor.getAttributes('highlight').color || '#fbbf24' }}></div>
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1.5"></div>

        {/* ۳. توان و زیرنویس */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="توان (بالانویس)">
          <EditorIcon name="superscript"/>
        </ToolbarButton>
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="زیرنویس">
          <EditorIcon name="subscript"/>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1.5"></div>

        {/* ۴. تیترها */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="تیتر بزرگ (H2)">
          <EditorIcon name="h2"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="تیتر متوسط (H3)">
          <EditorIcon name="h3"/>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1.5"></div>

        {/* ۵. جهت متن */}
        <ToolbarButton onClick={() => editor.chain().focus().setDirection('rtl').setTextAlign('right').run()} isActive={isRtl} title="راست‌چین (متن و اعداد فارسی)">
          <EditorIcon name="directionRtl"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().setDirection('ltr').setTextAlign('left').run()} isActive={isLtr} title="چپ‌چین (متن و اعداد انگلیسی)">
          <EditorIcon name="directionLtr"/>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1.5"></div>

        {/* ۶. ترازهای متنی */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="تراز به راست">
          <EditorIcon name="alignRight"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="تراز وسط">
          <EditorIcon name="alignCenter"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="تراز به چپ">
          <EditorIcon name="alignLeft"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="تراز هم‌اندازه (جاستی‌فای)">
          <EditorIcon name="alignJustify"/>
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1.5"></div>

        {/* ۷. لیست‌ها و نقل‌قول */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="لیست نقطه‌ای">
          <EditorIcon name="listBullets"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="لیست عددی">
          <EditorIcon name="listNumbers"/>
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="نقل‌قول">
          <EditorIcon name="textBlockquote"/>
        </ToolbarButton>

        {/* ۸. دکمه افزودن رسانه */}
        {onOpenMedia && (
          <>
            <div className="w-px h-6 bg-white/10 mx-1.5"></div>
            <button 
              type="button" 
              onClick={() => onOpenMedia(editor)} 
              className={`h-[34px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:${activeTheme.bg} hover:text-white hover:border-transparent transition-all flex items-center gap-2 cursor-pointer mr-auto shadow-inner GKEditorMediaBtn`}
              title="انتخاب و درج تصویر، ویدیو یا صوت از کتابخانه رسانه"
            >
              <EditorIcon name="media"/>
              <span className="text-xs font-bold font-sans hidden sm:block">افزودن رسانه</span>
            </button>
          </>
        )}
      </div>

      {/* ناحیه ویرایش متن */}
      <EditorContent editor={editor} className="font-sans flex-grow ProseMirror-content ProseMirror-base" />

      {/* استایل‌های بخش ادیتور */}
      <style jsx global>{`
        .ProseMirror [style*="text-align: right"] { text-align: right !important; }
        .ProseMirror [style*="text-align: center"] { text-align: center !important; }
        .ProseMirror [style*="text-align: left"] { text-align: left !important; }
        .ProseMirror [style*="text-align: justify"] { text-align: justify !important; }
        
        .ProseMirror [dir="rtl"] { direction: rtl; }
        .ProseMirror [dir="ltr"] { direction: ltr; }

        .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: right;
          color: #6b7280;
          pointer-events: none;
          height: 0;
          font-style: normal;
        }
        
        .ProseMirror p { margin-bottom: 0.75rem; }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .ProseMirror h3 { font-size: 1.1rem; font-weight: 700; color: #e5e7eb; margin-top: 1.25rem; margin-bottom: 0.5rem; }

        .ProseMirror a { color: #06b6d4; text-decoration: underline; cursor: pointer; transition: color 0.2s; }
        .ProseMirror a:hover { color: #0891b2; }
        .ProseMirror mark { background-color: #fbbf24; border-radius: 4px; padding: 2px 4px; color: inherit; }
        .ProseMirror sup { vertical-align: super; font-size: 0.75em; line-height: 0; }
        .ProseMirror sub { vertical-align: sub; font-size: 0.75em; line-height: 0; }
        
        /* استایل رندر تصاویر درون ادیتور */
        .ProseMirror img.editor-image {
          display: inline-block;
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .ProseMirror ol,
        .ProseMirror ul {
          list-style-position: inside !important;
          padding: 0 !important;
          margin: 0.75rem 0 !important;
        }

        .ProseMirror li { margin-bottom: 0.5rem; }
        .ProseMirror li > p { display: inline !important; margin-bottom: 0 !important; }

        .ProseMirror ol:not([dir="ltr"]),
        .ProseMirror ol[dir="rtl"] { list-style-type: persian !important; direction: rtl; }
        .ProseMirror ul:not([dir="ltr"]),
        .ProseMirror ul[dir="rtl"] { list-style-type: disc !important; direction: rtl; }

        .ProseMirror ol[dir="ltr"] { list-style-type: decimal !important; direction: ltr; }
        .ProseMirror ul[dir="ltr"] { list-style-type: disc !important; direction: ltr; }

        .ProseMirror blockquote {
          margin: 1rem 0;
          color: #9ca3af;
          font-style: italic;
          padding: 0.5rem 1rem;
          background: rgba(6, 182, 212, 0.05);
          border-radius: 8px;
        }

        .ProseMirror blockquote:not([dir="ltr"]),
        .ProseMirror blockquote[dir="rtl"] { border-right: 4px solid #06b6d4; border-left: none; text-align: right; }
        .ProseMirror blockquote[dir="ltr"] { border-left: 4px solid #06b6d4; border-right: none; text-align: left; }
      `}</style>
    </div>
  );
}