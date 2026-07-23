import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { cn } from '@/lib/cn';

type Props = Readonly<{
  content: string;
  className?: string;
}>;

const components: Components = {
  h1: ({ children }) => (
    <h1 className="report-md__h1">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="report-md__h2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="report-md__h3">{children}</h3>
  ),
  p: ({ children }) => <p className="report-md__p">{children}</p>,
  ul: ({ children }) => <ul className="report-md__ul">{children}</ul>,
  ol: ({ children }) => <ol className="report-md__ol">{children}</ol>,
  li: ({ children }) => <li className="report-md__li">{children}</li>,
  strong: ({ children }) => <strong className="report-md__strong">{children}</strong>,
  em: ({ children }) => <em className="report-md__em">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} className="report-md__a" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="report-md__quote">{children}</blockquote>
  ),
  hr: () => <hr className="report-md__hr" />,
  code: ({ children, className }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return <code className={cn('report-md__code-block', className)}>{children}</code>;
    }
    return <code className="report-md__code">{children}</code>;
  },
  pre: ({ children }) => <pre className="report-md__pre">{children}</pre>,
};

export function ReportMarkdown({ content, className }: Props): React.ReactNode {
  return (
    <article className={cn('report-md', className)}>
      <Markdown components={components}>{content}</Markdown>
    </article>
  );
}
