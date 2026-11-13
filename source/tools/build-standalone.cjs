const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'assets-manifest.json'),'utf8'));
function inline(text){for(const asset of manifest)text=text.split(asset.file).join('data:'+asset.mime+';base64,'+fs.readFileSync(path.join(root,asset.file)).toString('base64'));return text;}
let html=inline(fs.readFileSync(path.join(root,'index.html'),'utf8')),css=inline(fs.readFileSync(path.join(root,'app.css'),'utf8')),js=inline(fs.readFileSync(path.join(root,'app.js'),'utf8'));
html=html.replace(/<link rel="stylesheet" href="\.\/app\.css(\?[^"]*)?">/,()=>'<style>'+css+'</style>').replace(/<script src="\.\/app\.js(\?[^"]*)?"><\/script>/,()=>'<script>'+js+'</script>');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/starlight-yard.html'),html);console.log('Built dist/starlight-yard.html');
