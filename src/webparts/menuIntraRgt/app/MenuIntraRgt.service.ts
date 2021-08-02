import { Injectable } from '@angular/core';
import {
    HttpClient, HttpHeaders,
} from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";

import { sp } from "@pnp/sp";



@Injectable()
export class MenuIntraRgtService {

    constructor(private http: HttpClient) {

    }


    public obtenerTiposMacroproceso(): Promise<any> {
        return sp.web.lists.getByTitle("Tipos de Macroproceso").items.get();
    }

    public obtenerMacroprocesos(): Promise<any> {
        return sp.web.lists.getByTitle("MacroProceso").items.get();
    }

    public obtenerTiposCertificacion(): Promise<any> {
        return sp.web.lists.getByTitle("Tipos de Certificación").items.get();
    }

    public obtenerUsuarios(): Promise<any> {
        return sp.web.lists.getByTitle("Usuarios").items.get();
    }

    public ObtenerDatosUsuarioById(url) {
        let encabezado: HttpHeaders;
        encabezado = new HttpHeaders()
            .append('Accept', "application/json; odata=verbose");
        return this.http.get<any>(
            url,
            {
                headers: encabezado
            }
        );
    }

    public obtenerProcesos(): Promise<any> {
        return sp.web.lists.getByTitle("Proceso").items.get();
    }


    public obtenerTiposDocumentos(): Promise<any> {
        return sp.web.lists.getByTitle("Tipos de Documentos").items.get();
    }

    public obtenerTiposPublicacion(): Promise<any> {
        return sp.web.lists.getByTitle("Tipos de Publicación").items.get();
    }

    public obtenerDocumentos(): Promise<any> {
        return sp.web.lists.getByTitle("Centro de Documentación").items.get();
    }

    public obtenerAutorizadores(): Promise<any> {
        return sp.web.lists.getByTitle("Autorizadores").items.get();
    }

    public obtenerEjecutores(): Promise<any> {
        return sp.web.lists.getByTitle("Ejecutores").items.get();
    }

    public obtenerTiposEjecutoresAutorizadores(): Promise<any> {
        return sp.web.lists.getByTitle("Tipos de Autorizadores y Ejecutores").items.get();
    }

}
