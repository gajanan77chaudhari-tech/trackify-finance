import Image from 'next/image';

export function AppLogo() {
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white p-1">
      <Image
        src="https://uploads.onecompiler.io/42zwkdaww/43t68b9vk/Screenshot%202025-08-09%20100915.png"
        alt="Trackify Finance Logo"
        width={48}
        height={48}
        className="rounded-full"
      />
    </div>
  );
}
