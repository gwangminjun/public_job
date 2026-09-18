import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function StudyMarkdown({ children }: { children: string }) {
  return (
    <div className="study-markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={{
        table: ({ children }) => <div className="study-table-scroll" tabIndex={0} role="region" aria-label="비교표 (가로 스크롤 가능)"><table>{children}</table></div>,
      }}>{children}</Markdown>
    </div>
  );
}
