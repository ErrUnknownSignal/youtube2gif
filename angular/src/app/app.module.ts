import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SecondFormatterDirective } from './second-formatter.directive';
import {DecimalPipe} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ApiService} from './service/api.service';


@NgModule({
  declarations: [
    AppComponent,
    SecondFormatterDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [DecimalPipe, ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
