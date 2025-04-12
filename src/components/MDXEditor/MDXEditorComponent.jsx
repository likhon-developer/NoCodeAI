import React, { useEffect, useState, useRef } from 'react';
import { MDXEditor } from '@mdxeditor/editor';
import { headingsPlugin } from '@mdxeditor/editor/plugins/headings';
import { listsPlugin } from '@mdxeditor/editor/plugins/lists';
import { quotePlugin } from '@mdxeditor/editor/plugins/quote';
import { thematicBreakPlugin } from '@mdxeditor/editor/plugins/thematic-break';
import { linkPlugin } from '@mdxeditor/editor/plugins/link';
import { imagePlugin } from '@mdxeditor/editor/plugins/image';
import { tablePlugin } from '@mdxeditor/editor/plugins/table';
import { codeBlockPlugin } from '@mdxeditor/editor/plugins/codeblock';
import { markdownShortcutPlugin } from '@mdxeditor/editor/plugins/markdown-shortcut';
import { diffSourcePlugin } from '@mdxeditor/editor/plugins/diff-source';
import { toolbarPlugin } from '@mdxeditor/editor/plugins/toolbar';
import { UndoRedo } from '@mdxeditor/editor/plugins/toolbar/components/UndoRedo';
import { BoldItalicUnderlineToggles } from '@mdxeditor/editor/plugins/toolbar/components/BoldItalicUnderlineToggles';
import { BlockTypeSelect } from '@mdxeditor/editor/plugins/toolbar/components/BlockTypeSelect';
import { InsertImage } from '@mdxeditor/editor/plugins/toolbar/components/InsertImage';
import { InsertTable } from '@mdxeditor/editor/plugins/toolbar/components/InsertTable';
import { InsertCodeBlock } from '@mdxeditor/editor/plugins/toolbar/components/InsertCodeBlock';
import { InsertLink } from '@mdxeditor/editor/plugins/toolbar/components/InsertLink';
import { ListsToggle } from '@mdxeditor/editor/plugins/toolbar/components/ListsToggle';
import { DiffSourceToggleWrapper } from '@mdxeditor/editor/plugins/toolbar/components/DiffSourceToggleWrapper';
import { Save } from 'lucide-react';
import './MDXEditorComponent.css';

// Import MDX Editor styles
import '@mdxeditor/editor/style.css';

const MDXEditorComponent = ({ 
  initialContent = '',
  onSave = () => {},
  readOnly = false,
  projectId = null
}) => {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const editorRef = useRef(null);

  // Auto-save content periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (content !== initialContent) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [content, initialContent]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(content, projectId);
      setLastSaved(new Date());
      setSaving(false);
    } catch (error) {
      console.error('Failed to save documentation:', error);
      setSaving(false);
    }
  };

  // Custom image upload handler
  const imageUploadHandler = async (image) => {
    try {
      // This would typically upload to your storage service
      // For now, we'll create a data URL as placeholder
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(image);
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  // Custom toolbar with save button
  const CustomToolbar = () => (
    <div className="mdx-editor-toolbar">
      <UndoRedo />
      <BoldItalicUnderlineToggles />
      <ListsToggle />
      <BlockTypeSelect />
      <InsertLink />
      <InsertImage />
      <InsertTable />
      <InsertCodeBlock />
      <DiffSourceToggleWrapper>
        <button 
          className="toolbar-save-button" 
          onClick={handleSave}
          disabled={saving || content === initialContent}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </DiffSourceToggleWrapper>
    </div>
  );

  return (
    <div className="mdx-editor-container">
      <MDXEditor
        ref={editorRef}
        markdown={content}
        onChange={handleContentChange}
        readOnly={readOnly}
        contentEditableClassName="mdx-editor-content"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          imagePlugin({
            imageUploadHandler
          }),
          tablePlugin(),
          codeBlockPlugin({
            defaultCodeBlockLanguage: 'javascript',
          }),
          markdownShortcutPlugin(),
          diffSourcePlugin({
            diffMarkdown: initialContent,
            viewMode: 'rich-text',
          }),
          toolbarPlugin({
            toolbarContents: () => <CustomToolbar />
          })
        ]}
      />
      
      {lastSaved && (
        <div className="mdx-editor-status">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default MDXEditorComponent;
