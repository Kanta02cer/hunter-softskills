export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#FF8C00] to-[#ff7700] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <img 
              src="https://public.readdy.ai/ai/img_res/e3a20a4a-bbbb-45af-ab2f-cc790e7285cf.jpg" 
              alt="HUNTER Logo" 
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-sm text-white/90 mb-4">
              HUNTER　ソフトスキル検定
            </p>
            <p className="text-sm text-white/90">
              各種検定試験の情報や申し込みができる公式ポータルサイトです。
            </p>
          </div>
          
          <div>
            <div className="space-y-2 text-sm text-white/90">
              <p>〒197-0012</p>
              <p>東京都福生市加美平3-17-1</p>
              <p>登紀和ビル2階</p>
              <p className="mt-4">Email: info@hunter-softskills.com</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-white/80">© 2025 HUNTER　ソフトスキル検定　All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-white/80 hover:text-white transition-colors cursor-pointer">プライバシーポリシー</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors cursor-pointer">利用規約</a>
            <a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors cursor-pointer">Website Builder</a>
          </div>
        </div>
      </div>
    </footer>
  );
}