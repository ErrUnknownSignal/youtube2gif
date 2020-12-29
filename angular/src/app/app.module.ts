import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {FormsModule} from "@angular/forms";
import { SecondFormatterDirective } from './second-formatter.directive';
import {DecimalPipe} from "@angular/common";


@NgModule({
  declarations: [
    AppComponent,
    SecondFormatterDirective
  ],
    imports: [
        BrowserModule,
        FormsModule
    ],
  providers: [DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
