import React from 'react';

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 py-2 border-b border-notion-border">
        <p className="font-semibold text-notion-text-light">{label}</p>
        <div className="col-span-2 text-notion-text">{children}</div>
    </div>
);


export const Section: React.FC<SectionProps> = ({ title, children }) => {
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
             // A simple way to check if it's a component that can accept props.
            // This is a naive check; for robust solution, consider context or cloning with specific props.
             const element = child as React.ReactElement<any>;
             if(element.props.label && element.props.children) {
                 return <InfoRow label={element.props.label}>{element.props.children}</InfoRow>
             }
        }
        // FIX: The original check was not type-safe and caused build errors.
        // This updated logic uses React.Children.toArray to safely inspect children
        // and correctly transforms a <p> element with a leading <strong> tag into an InfoRow.
        // FIX: Add generic types to React.isValidElement to correctly infer props and avoid type errors.
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === 'p') {
            const pChildren = React.Children.toArray(child.props.children);
            if (pChildren.length > 0) {
                const firstChild = pChildren[0];
                // FIX: Add generic types to React.isValidElement to correctly infer props and avoid type errors.
                if (React.isValidElement<{ children?: React.ReactNode }>(firstChild) && firstChild.type === 'strong' && typeof firstChild.props.children === 'string') {
                    const label = firstChild.props.children;
                    const content = pChildren.slice(1);
                    return <InfoRow label={label}>{content}</InfoRow>;
                }
            }
        }
        return child;
    });


    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-notion-text mb-4">
                {title}
            </h2>
            <div className="text-base leading-relaxed space-y-1">
                {/* FIX: Render the transformed children (`childrenWithProps`) instead of the original `children`. */}
                {childrenWithProps}
            </div>
        </div>
    );
};
