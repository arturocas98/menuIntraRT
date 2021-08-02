import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from "@angular/http";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuIntraRgtComponent } from './app/MenuIntraRgt.component';
import { MenuIntraRgtService } from './app/MenuIntraRgt.service';
import { ModalModule } from 'ngx-bootstrap';



@NgModule({
    declarations: [
        MenuIntraRgtComponent,
  
      
    ],
    
    imports: [
        BrowserModule,
        HttpClientModule,
        NgbModule.forRoot(),
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
       
    ],
    
    providers: [
        MenuIntraRgtService
    ],
    bootstrap: [
        MenuIntraRgtComponent,
       

    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    
})

export class MenuIntraRgtModule { }
