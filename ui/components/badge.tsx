type Props = {
    children?: React.ReactNode;
    color?: string;
    className?: string;
};

export default function Badge({
    children,
    color,
    className
}: Props) {
    return (
        <span className={`${className} inline-flex items-center cursor-pointer py-1 px-3 space-x-2 rounded-xl hover:scale-110 border`}>
            <svg className="w-2 h-2" viewBox="0 0 6 6">
                <circle cx="3" cy="3" fill={color} r="3" />
            </svg>
            <div>{children}</div>
        </span>
    )
}
