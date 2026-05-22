import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PdfReaderComponent } from './pdf-reader.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';

const routes: Routes = [
  { path: '', component: PdfReaderComponent }
];

@NgModule({
  declarations: [PdfReaderComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    PickerModule,
    EmojiModule
  ]
})
export class PdfReaderModule {}
