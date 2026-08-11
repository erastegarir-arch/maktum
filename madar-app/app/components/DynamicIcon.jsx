import { prisma } from '@/lib/prisma';

export default async function DynamicIcon({ name, className = "w-6 h-6" }) {
  try {
    const icon = await prisma.iconLibrary.findUnique({ where: { name } });
    
    if (!icon) return null;

    // رندر مستقیم کدهای SVG در HTML به همراه کلاس جادویی ارث‌بری رنگ
    return (
      <span 
        className={`svg-inherit-color inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full ${className}`} 
        dangerouslySetInnerHTML={{ __html: icon.svgCode }} 
      />
    );
  } catch (error) {
    return null;
  }
}