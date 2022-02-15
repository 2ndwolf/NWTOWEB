import Globals from "./globals"

export default class Assets {
  private static images: { [id: string] : HTMLImageElement} = {}
  private static texts: { [id: string] : string} = {}
  private static imagePromises : {[id: string]: Promise<void>} = {}
  private static textPromises : {[id: string]: Promise<void>} = {}

  public static async getImage(id:string) : Promise<HTMLImageElement> {
    // if(Assets.imagePromises[Assets.defaultImage]) await Assets.imagePromises[Assets.defaultImage]
    if(Assets.imagePromises[id]) await Assets.imagePromises[id]
    return Assets.images[id] || Assets.images[Globals.defaultImage] || undefined
  }
  public static async getText(id:string) : Promise<string> {
    await Assets.textPromises[id]
    return Assets.texts[id] || "TEXT FILE NOT FOUND"
  }

  public static isTxtExt(ext:string){
    return Globals.getTxtExts().indexOf(ext) > - 1
  }

  public static isImgExt(ext:string){
    return Globals.getImgExts().indexOf(ext) > - 1
  }


  public static async loadAssets(assetList: {[id: string]: string}) : Promise<void>{
    for(let ast in assetList){
      const splt : Array<string> = assetList[ast].split('/')
      const fileName : string = splt[splt.length-1]
      const fileNmExt : Array<string> = fileName.split('.')
      if(Assets.isImgExt(fileNmExt[fileNmExt.length-1]) && !Object.keys(Assets.imagePromises).includes(ast)) {
        Assets.imagePromises[ast] = new Promise ( resolve=>{
          resolve(Assets.loadImage(ast,assetList[ast]))
      })} else if (Assets.isTxtExt(fileNmExt[fileNmExt.length-1]) && !Object.keys(Assets.imagePromises).includes(ast)) {
        Assets.textPromises[ast] = new Promise ( resolve=>{
          resolve(Assets.loadText(ast,assetList[ast]))
      })}
    }
  }

  public static async loadImage(id:string,file:string): Promise<void>{

    let response : Response = await fetch(file)
    let myBlob : Blob = await response.blob()
    let ab : any = await this.blobToBase64(myBlob)

    await new Promise<void>(resolve=> {
      let image : HTMLImageElement = document.createElement('img');
      image.src = ab;

      image.addEventListener("load", ()=>{        
        Assets.images[id] = image
        resolve()})
    })
  }

  public static async loadText(id:string,file:string): Promise<void>{
      const response : Response = await fetch(file)
      const data : string = await response.text();
      Assets.texts[id] = data;
  }

  public static async save(){
    let data = new Blob([await Assets.getText('cellFile')])
    // get the current state of the file in editor
    // and make a nw compatible file with it

    let linkD = await this.blobToBase64(data)
    let a = document.createElement("a")

    a.href = linkD.toString()
    a.click()
      
  }

  private static async blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}