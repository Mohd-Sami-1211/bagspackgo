export default function Loader({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-4 h-4 border-[2px]',
    md: 'w-5 h-5 border-[3px]',
    lg: 'w-8 h-8 border-4',
  };

  return (
    <div className="flex justify-center items-center py-8 gap-3">
      <div className={`${sizes[size]} border-green-200 border-t-green-500 rounded-full animate-spin`} />
      {text && <span className="text-sm text-neutral-500 font-medium">{text}</span>}
    </div>
  );
}