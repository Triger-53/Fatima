
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Info, AlertTriangle, Octagon, Lightbulb, Terminal } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- Custom Components ---

const Alert = ({ type, title, children }) => {
    const styles = {
        note: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', icon: Info },
        tip: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-300', icon: Lightbulb },
        important: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-800 dark:text-purple-300', icon: Octagon },
        warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', icon: AlertTriangle },
        caution: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-300', icon: Octagon },
    };

    const style = styles[type] || styles.note;
    const Icon = style.icon;

    return (
        <div className={cn("my-4 rounded-lg border p-4", style.bg, style.border)}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("w-5 h-5", style.text)} />
                <span className={cn("font-semibold capitalize", style.text)}>{title || type}</span>
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-7">
                {children}
            </div>
        </div>
    );
};

// Handle GitHub specific alerts in blockquotes
const Blockquote = ({ children, ...props }) => {
    // Check if children content matches alert pattern like [!NOTE]
    const content = React.Children.toArray(children);
    const firstChild = content[0];

    if (React.isValidElement(firstChild) && firstChild.props?.node?.tagName === 'p') {
        const text = firstChild.props.children?.[0];
        if (typeof text === 'string') {
            const match = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);
            if (match) {
                const type = match[1].toLowerCase();
                // Remove the [!TYPE] text from the first paragraph
                const newFirstChild = React.cloneElement(firstChild, {
                    ...firstChild.props,
                    children: [text.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/, '').trim(), ...firstChild.props.children.slice(1)]
                });

                return <Alert type={type}>{newFirstChild}{content.slice(1)}</Alert>;
            }
        }
    }

    return (
        <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600 bg-gray-50 py-3 rounded-r-lg" {...props}>
            {children}
        </blockquote>
    );
};

const CodeBlock = ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const [copied, setCopied] = useState(false);
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!inline && match) {
        return (
            <div className="relative my-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-md bg-[#1e1e1e] group">
                <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-300 lowercase font-mono">
                            {match[1]}
                        </span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-gray-400 hover:text-green-400 transition-colors rounded-md hover:bg-gray-700/50"
                        title="Copy code"
                        aria-label="Copy code to clipboard"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                            margin: 0,
                            padding: '1.25rem',
                            background: 'transparent',
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        }}
                        {...props}
                    >
                        {codeString}
                    </SyntaxHighlighter>
                </div>
            </div>
        );
    }

    return (
        <code
            className={cn(
                "px-1.5 py-0.5 rounded-md font-mono text-[0.9em]",
                "bg-gray-100 text-gray-800",
                "border border-gray-200",
                className
            )}
            {...props}
        >
            {children}
        </code>
    );
};

// --- Main Component ---

const StyledMarkdown = ({ content }) => {
    return (
        <div className="w-full text-gray-900 font-sans antialiased">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    code: CodeBlock,
                    blockquote: Blockquote,
                    // Headings
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-extrabold tracking-tight mt-6 mb-4 text-gray-900 border-b border-gray-200 pb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold tracking-tight mt-6 mb-3 text-gray-800" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold tracking-tight mt-5 mb-2 text-gray-800" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-base font-semibold tracking-tight mt-4 mb-2 text-gray-800" {...props} />,

                    // Paragraphs & Lists
                    p: ({ node, ...props }) => <p className="leading-7 text-sm sm:text-base mb-4 text-gray-700" {...props} />,
                    ul: ({ node, ...props }) => <ul className="my-4 ml-6 list-disc [&>li]:mt-1 marker:text-gray-400" {...props} />,
                    ol: ({ node, ...props }) => <ol className="my-4 ml-6 list-decimal [&>li]:mt-1 marker:font-medium marker:text-gray-500" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-7 text-sm sm:text-base text-gray-700 pl-1" {...props} />,

                    // Interactive & Media
                    a: ({ node, ...props }) => (
                        <a
                            className="font-medium text-blue-600 hover:underline decoration-blue-300 underline-offset-4 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        />
                    ),
                    hr: ({ node, ...props }) => <hr className="my-6 border-gray-200" {...props} />,
                    img: ({ node, ...props }) => (
                        // eslint-disable-next-line
                        <div className="my-6">
                            <img
                                className="rounded-xl shadow-md border border-gray-200 w-full h-auto object-cover max-h-[400px]"
                                loading="lazy"
                                {...props}
                            />
                            {props.alt && (
                                <span className="block mt-2 text-center text-xs text-gray-500 italic">
                                    {props.alt}
                                </span>
                            )}
                        </div>
                    ),

                    // Tables
                    table: ({ node, ...props }) => (
                        <div className="my-6 w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left" {...props} />
                            </div>
                        </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-gray-50 text-gray-900 border-b border-gray-200" {...props} />,
                    tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 bg-white" {...props} />,
                    tr: ({ node, ...props }) => <tr className="transition-colors hover:bg-gray-50/50" {...props} />,
                    th: ({ node, ...props }) => <th className="px-6 py-3 font-semibold whitespace-nowrap" {...props} />,
                    td: ({ node, ...props }) => <td className="px-6 py-4 text-gray-600" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default StyledMarkdown;
