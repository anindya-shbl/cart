import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class UploadImagesService {

  prscFiles: any = [];
  prscImages: any = [];
  savedPrscFile: any = [];

  constructor(private domSanitizer: DomSanitizer) { }

  onSelectFile(event:any, count: any, selectedFiles: any, selectedImges: any){

    this.prscFiles = [];
    this.prscImages = [];
    let totalMb = 0;
    let isvalidArr = [];
    let isvalid : any;

    const files = [...event.target.files, ...selectedFiles];

    // console.log(files);
    if(files && files.length <= count){
      for (let i = 0; i < files.length; i++) {
        totalMb += files[i].size;
        let ext = files[i].name.substr(files[i].name.lastIndexOf('.') + 1);
        if (ext == 'jpg' || ext == 'jpeg' || ext == 'pdf') {
          isvalidArr.push(ext)
        } else {
          isvalidArr.push('invalid')
        }
      }
      // console.log(totalMb /(1024*1024));

      let checkMb = Math.round(totalMb /(1024*1024));
      isvalid = !isvalidArr.includes('invalid');

      if(isvalid){
        if(checkMb <= 5){
          for(let i=0; i<files.length; i++){
            const image = {
              name : '',
              type : '',
              size : '',
              url: {}
            };
            this.prscFiles.push(files[i]);
            this.savedPrscFile = [];
            
              image.name = files[i].name;
              image.type = files[i].type;
              image.size = files[i].size;
              const reader = new FileReader();
              reader.onload = (filedata) =>{
                // image.url= reader.result + '';
                image.url = this.domSanitizer.bypassSecurityTrustUrl(reader.result+'')
                this.prscImages.push(image)
              }
              reader.readAsDataURL(files[i]);
              // this.ValidateContinue = false;
          }
  
          return {
            'fileDetails': this.prscFiles,
            'Images' : this.prscImages,
            'msg' : 'success'
          }
        }else{
          // alert("you can upload maximum 5Mb file");
          this.prscFiles = [];
          this.prscImages = [];
          return {
            'fileDetails': selectedFiles,
            'Images' : selectedImges,
            'msg' : 'you can upload maximum 5Mb file'
          }
        }
      }else{
        // alert("you can upload maximum 5Mb file");
        this.prscFiles = [];
        this.prscImages = [];
        return {
          'fileDetails': selectedFiles,
          'Images' : selectedImges,
          'msg' : 'Only .jpg,.jpeg,.pdf files are allowed'
        }
      }
    }else{
      // alert("you can select maximum 4 files");
      this.prscFiles = [];
      this.prscImages = [];
      return {
        'fileDetails': selectedFiles,
        'Images' : selectedImges,
        'msg' : `you can select maximum ${count} files`
      }
    }
    event.srcElement.value = null;
  }

  // onSelectFile_bckp(event:any, count: any, selectedFiles: any, selectedImges: any){

  //   this.prscFiles = [];
  //   this.prscImages = [];
  //   let totalMb = 0;

  //   const files = [...event.target.files, ...selectedFiles];

  //   // console.log(files);
  //   if(files && files.length <= count){
  //     for(let i=0; i<files.length; i++){
  //       totalMb += files[i].size;
  //     }
  //     // console.log(totalMb /(1024*1024));

  //     let checkMb = Math.round(totalMb /(1024*1024));

  //     if(checkMb <= 5){
  //       for(let i=0; i<files.length; i++){
  //         const image = {
  //           name : '',
  //           type : '',
  //           size : '',
  //           url: {}
  //         };
  //         this.prscFiles.push(files[i]);
  //         this.savedPrscFile = [];
          
  //           image.name = files[i].name;
  //           image.type = files[i].type;
  //           image.size = files[i].size;
  //           const reader = new FileReader();
  //           reader.onload = (filedata) =>{
  //             // image.url= reader.result + '';
  //             image.url = this.domSanitizer.bypassSecurityTrustUrl(reader.result+'')
  //             this.prscImages.push(image)
  //           }
  //           reader.readAsDataURL(files[i]);
  //           // this.ValidateContinue = false;
  //       }

  //       return {
  //         'fileDetails': this.prscFiles,
  //         'Images' : this.prscImages,
  //         'msg' : 'success'
  //       }
  //     }else{
  //       // alert("you can upload maximum 5Mb file");
  //       this.prscFiles = [];
  //       this.prscImages = [];
  //       return {
  //         'fileDetails': selectedFiles,
  //         'Images' : selectedImges,
  //         'msg' : 'you can upload maximum 5Mb file'
  //       }
  //     }
  //   }else{
  //     // alert("you can select maximum 4 files");
  //     this.prscFiles = [];
  //     this.prscImages = [];
  //     return {
  //       'fileDetails': selectedFiles,
  //       'Images' : selectedImges,
  //       'msg' : `you can select maximum ${count} files`
  //     }
  //   }
  //   event.srcElement.value = null;
  // }

  delFile(img: any){
    const index = this.prscImages.indexOf(img);
    this.prscImages.splice(index, 1);
    this.prscFiles.splice(index, 1);
    if(this.prscFiles.length == 0){
      // this.ValidateContinue = true;
    }
  }
}
