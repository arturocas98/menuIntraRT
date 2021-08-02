import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpEventType, HttpEvent, HttpErrorResponse, HttpClient } from '@angular/common/http';

import { IWebPartContext } from '@microsoft/sp-webpart-base';
import { forkJoin } from 'rxjs/observable/forkJoin';
import * as $ from 'jquery';
import { BehaviorSubject } from 'rxjs';
import { sp, FieldAddResult, ChoiceFieldFormatType } from "@pnp/sp";
import { MenuIntraRgtService } from './MenuIntraRgt.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web } from "@pnp/sp";

import Swal from 'sweetalert2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';



@Component({
    selector: 'menu-intra-rgt',
    template: require('./MenuIntraRgt.component.html'),
    styles: [
        String(require('./MenuIntraRgt.component.css'))
    ]
})
export class MenuIntraRgtComponent implements OnInit {


    public contextoWebPart: IWebPartContext;
    public propiedadesWebPart: any;

    public menu: Array<any> = [];

    public documentos: Array<any> = [];
    public tipos_macroprocesos: Array<any> = [];
    public servicios: Array<any> = [];
    public sitio: any;
    public form: FormGroup;
    public formProceso: FormGroup;
    public formSubProceso: FormGroup;
    public formDocumentos: FormGroup;
    public formAutorizadores: FormGroup;
    public formEjecutores: FormGroup;
    public macroprocesos: Array<any> = [];
    public certificaciones: Array<any> = [];
    public duenosProcesos: Array<any> = [];
    public certificacionId: any;
    public getMacroprocesoById: any;
    public getProcesoById: any;
    public procesos: Array<any> = [];
    public tipos_documentos: Array<any> = [];
    public tipos_publicacion: Array<any> = [];
    public autorizadores: Array<any> = [];
    public ejecutores: Array<any> = [];
    public tiposEjAut: Array<any> = [];
    public usuarios: Array<any> = [];
    public registraEjecutor: Boolean = false;
    public registraAutorizador: Boolean = false;
    public autorizadorID: any;
    public ejecutorID: any;

    public modalRefmd: BsModalRef | null;
    public modalRefSm: BsModalRef;
    public modalRefLg: BsModalRef;
    public archivo: File;
    constructor(
        private service: MenuIntraRgtService,
        public formBuilder: FormBuilder,
        private modalServiceNgx: BsModalService
    ) {

    }

    public ngOnInit() {
        this.contextoWebPart = window["webPartContextMenuIntraRgt"];
        this.propiedadesWebPart = window['webPartPropertiesMenuIntraRgt'];

        sp.setup({
            spfxContext: this.contextoWebPart
        });

        this.sitio = this.contextoWebPart.pageContext.web.absoluteUrl;
        this.scriptMenu();

        /* this.verificarLista(); */
        this.getTiposMacroproceso();
        this.getMacroprocesos();
        this.getCertificaciones();
        this.getDuenosProcesos();
        this.getTiposDocumentos();
        this.getTiposPublicacion();
        this.getTiposEjecutoresAutorizadores();
        this.getAutorizadores();
        this.getEjecutores();
        this.initForm();
        this.initFormProceso();
        this.initFormSubProceso();
        this.initFormDocumentos();
        this.initFormAutorizadores();
        this.initFormEjecutores();


        this.service.obtenerProcesos().then(datos => {
            this.procesos = datos;
            console.log("procesos:",this.procesos);
        });

        /* this.service.obtenerDocumentos().then(datosDoc => {
            console.log("datos doc:", datosDoc);
        }); */

    }

    public getTiposMacroproceso() {
        this.service.obtenerTiposMacroproceso().then(datos => {
            this.tipos_macroprocesos = datos;
        });
    }

    public getMacroprocesos() {
        this.service.obtenerMacroprocesos().then(datos => {
            this.macroprocesos = datos;
        });
    }

    public getCertificaciones() {
        this.service.obtenerTiposCertificacion().then(datos => {
            this.certificaciones = datos;
        });
    }

    public getDuenosProcesos() {
        this.service.obtenerUsuarios().then(datos => {

            let url = this.sitio + "/_api/web/siteusers";
            let getAllUsersInSite = [];
            this.service.ObtenerDatosUsuarioById(url).subscribe(response => {
                let allUserSite = response.d.results;

                for (const i in allUserSite) {
                    for (const j in datos) {

                        /**Filtramos que el usuario de la API de Sharepoint sea el mismo que esta 
                        en la lista Usuarios  */
                        if (allUserSite[i].Id == datos[j].UsuarioId[0]) {

                            allUserSite[i].UsuarioList = datos[j];
                            getAllUsersInSite.push(allUserSite[i]);

                        }

                    }

                }

                /* console.log("todos los usuarios del sitio:", getAllUsersInSite); */
                this.usuarios = getAllUsersInSite;
                this.duenosProcesos = getAllUsersInSite;
            });
        });
    }

    public getAutorizadores() {
        this.service.obtenerAutorizadores().then(datos => {
            let datos_filtrados = datos.filter(autorizador => autorizador.DocumentoIdId == null);

            this.autorizadores = datos_filtrados;
        });
    }

    public getEjecutores() {
        this.service.obtenerEjecutores().then(datos => {
            let datos_filtrados = datos.filter(ejecutor => ejecutor.DocumentoIdId == null);
            this.ejecutores = datos_filtrados;
        });
    }

    public getTiposEjecutoresAutorizadores() {
        this.service.obtenerTiposEjecutoresAutorizadores().then(datos => {
            this.tiposEjAut = datos;
        });
    }

    public changeTipoEjecutorAutorizador(){

    }

    public getTipoEjecutorAutorizador(id) {
        let tipo_filter = this.tiposEjAut.filter(tipo => tipo.Id = id);
        return tipo_filter[0].Title;

    }

    /**Rellena los formularios de Autorizadores y ejecutores con la informacion obtenida del usuario seleccionado */

    public obtenerUsuario(id, tipo) {
        let accountName = "atingo@righttekcom.onmicrosoft.com";
        let url = this.sitio + `/_api/web/getuserbyid(${id})`;
        /* let url = this.sitio + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" +accountName+ "'"; */
        let usuarioFilter = this.duenosProcesos.filter(usuario => usuario.UsuarioList.UsuarioId[0] == id);
        /* console.log("usuario filtrado rol:", usuarioFilter); */
        this.service.ObtenerDatosUsuarioById(url).subscribe(response => {
            if (tipo == "Autorizador") {
                this.formAutorizadores.controls['nombre'].setValue(response.d.Title);
                this.formAutorizadores.controls['userId'].setValue(response.d.UserId.NameId);
                this.formAutorizadores.controls['rol'].setValue(usuarioFilter[0].UsuarioList.Title);
            } else {
                this.formEjecutores.controls['nombre'].setValue(response.d.Title);
                this.formEjecutores.controls['userId'].setValue(response.d.UserId.NameId);
                this.formEjecutores.controls['rol'].setValue(usuarioFilter[0].UsuarioList.Title);
            }
        });

    }

    public getTiposDocumentos() {
        this.service.obtenerTiposDocumentos().then(datos => {
            this.tipos_documentos = datos;
        });
    }

    public getTiposPublicacion() {
        this.service.obtenerTiposPublicacion().then(datos => {
            this.tipos_publicacion = datos;
        });
    }



    /**Verificar que solo  */
    isAllSelected(item) {
        this.certificaciones.forEach(val => {
            if (val.Id == item.Id) val.isSelected = !val.isSelected;
            else {
                val.isSelected = false;
            }
        });
        this.certificacionId = item.Id;
    }

    /**Obtener información de macroproceso seleccionado */
    getFilterMacroproceso(id) {
        this.getMacroprocesoById = this.macroprocesos.filter(macroproceso => macroproceso.Id == id);
    }

    /** Obtener información de proceso seleccionado */
    getFilterProceso(id) {
        this.getProcesoById = this.procesos.filter(proceso => proceso.Id == id);
    }

    public initForm() {
        this.form = this.formBuilder.group({
            codigo: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            nombre: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            descripcion: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            tipo_macroproceso: ['', [Validators.required]],
            estado: ['', [Validators.required]],


        });
    }

    public initFormProceso() {
        this.formProceso = this.formBuilder.group({
            macroproceso: ['', [Validators.required]],
            codigo: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            nombre: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            objetivo: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            dueno_proceso: ['', [Validators.required]],
            criticidad: ['', [Validators.required]],
            certificacion: ['', [Validators.required]],
            estado: ['', [Validators.required]],
        });
    }

    public initFormSubProceso() {
        this.formSubProceso = this.formBuilder.group({
            proceso: ['', [Validators.required]],
            codigo: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            nombre: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            objetivo: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            certificacion: ['', [Validators.required]],
            estado: ['', [Validators.required]],
        });
    }

    public initFormDocumentos() {
        this.formDocumentos = this.formBuilder.group({
            codigo: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            tipo_documento: ['', [Validators.required]],
            tipo_publicacion: ['', [Validators.required]],
            archivo: ['', [Validators.required]],
            descripcion: ['', [Validators.required, Validators.pattern(/[A-Za-z0-9\s]*/)]],
            directorio: [''],
            estado: ['', [Validators.required]],
        });
    }

    public initFormAutorizadores() {
        this.formAutorizadores = this.formBuilder.group({
            nombre: [''],
            userId: [''],
            rol: [''],
            tipo_autorizador: ['', [Validators.required]],
            estado: ['', [Validators.required]],


        });
    }

    public initFormEjecutores() {
        this.formEjecutores = this.formBuilder.group({
            nombre: [''],
            userId: [''],
            rol: [''],
            tipo_ejecutor: ['', [Validators.required]],
            estado: ['', [Validators.required]],
        });
    }

    public scriptMenu() {
        let localSitio = this.sitio;
        $(document).ready(function () {

            function btnRtInforme() {
                $("#imgInforme").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/informe-rt.png"
                );
                $("#btnInforme").css("background-color", "white");
                $("#btnInforme").css("border-radius", "11px");
                $("#btnInforme").css("color", "#cc001e");
                $("#btnInforme").css("font-weight", "bold");
                $("#btnInforme").css("outline", "none");
            }


            function btnBlancoInforme() {
                $("#imgInforme").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/informe-blanco.png"
                );
                $("#btnInforme").css("background-color", "#cc001e");
                $("#btnInforme").css("border-radius", "11px");
                $("#btnInforme").css("color", "white");
                $("#btnInforme").css("font-weight", "bold");
                $("#btnInforme").css("outline", "none");
            }

            function btnRtSolicitud() {
                $("#imgSolicitud").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/solicitud-rt.png"
                );
                $("#btnSolicitud").css("background-color", "white");
                $("#btnSolicitud").css("border-radius", "11px");
                $("#btnSolicitud").css("color", "#cc001e");
                $("#btnSolicitud").css("font-weight", "bold");
                $("#btnSolicitud").css("outline", "none");
            }

            function btnBlancoSolicitud() {
                $("#imgSolicitud").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/solicitud-blanco.png"
                );
                $("#btnSolicitud").css("background-color", "#cc001e");
                $("#btnSolicitud").css("border-radius", "11px");
                $("#btnSolicitud").css("color", "white");
                $("#btnSolicitud").css("font-weight", "bold");
                $("#btnSolicitud").css("outline", "none");
            }


            function btnRtDocumentos() {
                $("#imgDocumentos").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/documento-rt.png"
                );
                $("#btnDocumentos").css("background-color", "white");
                $("#btnDocumentos").css("border-radius", "11px");
                $("#btnDocumentos").css("color", "#cc001e");
                $("#btnDocumentos").css("font-weight", "bold");
                $("#btnDocumentos").css("outline", "none");
            }

            function btnBlancoDocumentos() {
                $("#imgDocumentos").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/documento-blanco.png"
                );
                $("#btnDocumentos").css("background-color", "#cc001e");
                $("#btnDocumentos").css("border-radius", "11px");
                $("#btnDocumentos").css("color", "white");
                $("#btnDocumentos").css("font-weight", "bold");
                $("#btnDocumentos").css("outline", "none");
            }

            function btnRtEncuesta() {
                $("#imgEncuesta").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/encuesta-rt.png"
                );
                $("#btnEncuesta").css("background-color", "white");
                $("#btnEncuesta").css("border-radius", "11px");
                $("#btnEncuesta").css("color", "#cc001e");
                $("#btnEncuesta").css("font-weight", "bold");
                $("#btnEncuesta").css("outline", "none");
            }

            function btnBlancoEncuesta() {
                $("#imgEncuesta").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/encuesta-blanco.png"
                );
                $("#btnEncuesta").css("background-color", "#cc001e");
                $("#btnEncuesta").css("border-radius", "11px");
                $("#btnEncuesta").css("color", "white");
                $("#btnEncuesta").css("font-weight", "bold");
                $("#btnEncuesta").css("outline", "none");
            }

            function btnRtAyuda() {
                $("#imgAyuda").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/ayudar-rt.png"
                );
                $("#btnAyuda").css("background-color", "white");
                $("#btnAyuda").css("border-radius", "11px");
                $("#btnAyuda").css("color", "#cc001e");
                $("#btnAyuda").css("font-weight", "bold");
                $("#btnAyuda").css("outline", "none");
            }

            function btnBlancoAyuda() {
                $("#imgAyuda").attr(
                    "src",
                    localSitio + "/ImagenesIntranet/ayudar-blanco.png"
                );
                $("#btnAyuda").css("background-color", "#cc001e");
                $("#btnAyuda").css("border-radius", "11px");
                $("#btnAyuda").css("color", "white");
                $("#btnAyuda").css("font-weight", "bold");
                $("#btnAyuda").css("outline", "none");
            }


            $("#btnInforme").click(function (evento) {
                var displaying = $("#DivInforme").css("display");
                if (displaying == "none") {
                    $("#DivInforme").css("display", "block");
                    $("#DivSolicitud").css("display", "none");
                    $("#DivDocumentos").css("display", "none");
                    $("#DivEncuesta").css("display", "none");
                    $("#DivAyuda").css("display", "none");

                    $("#idrow2").css("display", "none");
                    $("#idrow3").css("display", "none");


                    btnRtInforme();
                    btnBlancoSolicitud();
                    btnBlancoDocumentos();
                    btnBlancoEncuesta();
                    btnBlancoAyuda();

                } else {
                    $("#DivInforme").css("display", "none");
                    $("#idrow2").css("display", "flex");
                    $("#idrow3").css("display", "flex");
                    $(".carousel-caption").css("position", "absolute");
                    btnBlancoInforme();

                }
            });

            $("#btnSolicitud").click(function (evento) {
                var displaying = $("#DivSolicitud").css("display");
                if (displaying == "none") {
                    $("#DivSolicitud").css("display", "block");
                    $("#DivInforme").css("display", "none");
                    $("#DivDocumentos").css("display", "none");
                    $("#DivEncuesta").css("display", "none");
                    $("#DivAyuda").css("display", "none");
                    $("#idrow2").css("display", "none");
                    $("#idrow3").css("display", "none");


                    btnRtSolicitud();
                    btnBlancoInforme();
                    btnBlancoDocumentos();
                    btnBlancoEncuesta();
                    btnBlancoAyuda();

                } else {
                    $("#DivSolicitud").css("display", "none");
                    $("#idrow2").css("display", "flex");
                    $("#idrow3").css("display", "flex");
                    $(".carousel-caption").css("position", "absolute");
                    btnBlancoSolicitud();

                }
            });

            $("#btnDocumentos").click(function (evento) {
                var displaying = $("#DivDocumentos").css("display");
                if (displaying == "none") {
                    $("#DivDocumentos").css("display", "block");
                    $("#DivInforme").css("display", "none");
                    $("#DivSolicitud").css("display", "none");
                    $("#DivEncuesta").css("display", "none");
                    $("#DivAyuda").css("display", "none");
                    $("#idrow2").css("display", "none");
                    $("#idrow3").css("display", "none");


                    btnRtDocumentos();
                    btnBlancoSolicitud();
                    btnBlancoInforme();
                    btnBlancoEncuesta();
                    btnBlancoAyuda();

                } else {
                    $("#DivDocumentos").css("display", "none");
                    $("#idrow2").css("display", "flex");
                    $("#idrow3").css("display", "flex");
                    $(".carousel-caption").css("position", "absolute");

                    btnBlancoDocumentos();
                }
            });

            $("#btnEncuesta").click(function (evento) {
                var displaying = $("#DivEncuesta").css("display");
                if (displaying == "none") {
                    $("#DivEncuesta").css("display", "block");
                    $("#DivInforme").css("display", "none");
                    $("#DivSolicitud").css("display", "none");
                    $("#DivDocumentos").css("display", "none");
                    $("#DivAyuda").css("display", "none");
                    $("#idrow2").css("display", "none");
                    $("#idrow3").css("display", "none");


                    btnRtEncuesta();
                    btnBlancoSolicitud();
                    btnBlancoInforme();
                    btnBlancoDocumentos();
                    btnBlancoAyuda();
                } else {
                    $("#DivEncuesta").css("display", "none");
                    $("#idrow2").css("display", "flex");
                    $("#idrow3").css("display", "flex");
                    $(".carousel-caption").css("position", "absolute");

                    btnBlancoEncuesta();
                }
            });

            $("#btnAyuda").click(function (evento) {
                var displaying = $("#DivAyuda").css("display");
                if (displaying == "none") {
                    $("#DivAyuda").css("display", "block");
                    $("#DivDocumentos").css("display", "none");
                    $("#DivInforme").css("display", "none");
                    $("#DivSolicitud").css("display", "none");
                    $("#DivEncuesta").css("display", "none");

                    $("#idrow2").css("display", "none");
                    $("#idrow3").css("display", "none");


                    btnRtAyuda();
                    btnBlancoSolicitud();
                    btnBlancoInforme();
                    btnBlancoDocumentos();
                    btnBlancoEncuesta();
                } else {
                    $("#DivAyuda").css("display", "none");
                    $("#idrow2").css("display", "flex");
                    $("#idrow3").css("display", "flex");
                    $(".carousel-caption").css("position", "absolute");

                    btnBlancoAyuda();
                }
            });

        });

    }

    /** Método para abrir modal con ngx bootstrap modal
    */
    openModal(template: TemplateRef<any>) {
        this.modalRefmd = this.modalServiceNgx.show(template, { class: 'modal-dialog-centered  my-modal-md' });
    }

    /**Abrir el modal de directorios,Autorizadores */

    openModalSm(template: TemplateRef<any>) {
        this.modalRefSm = this.modalServiceNgx.show(template, { class: 'modal-dialog-centered second my-modal-sm ' });
    }

    /** Método para abrir modal documentos con ngx bootstrap modal
    */
    openModalLg(template: TemplateRef<any>) {
        this.modalRefLg = this.modalServiceNgx.show(template, { class: 'modal-dialog-centered  my-modal-lg' });
    }

    /**Método para validar cada campo del formulario 
    * Valida si tiene errores o esta sucio(si lo ha tocado el usuario) el Input
    */

    public validatorErrorField(field, form) {
        return form.get(field).errors && form.get(field).dirty;
    }


    /**Método para presentar alertas de tipo Sweet Alert */

    public presentaAlert(tipo, text?) {
        switch (tipo) {
            case "error":
                Swal({
                    title: "Error",
                    text: text,
                    width: "46rem",
                    confirmButtonColor: '#cc001e'
                });

                break;
            case "loading":
                Swal({
                    allowOutsideClick: false,
                    text: "Cargando....",
                    width: "60rem",

                });
                Swal.showLoading();

                break;

            case "success":
                Swal({
                    title: "Registro éxitoso",
                    text: text,
                    confirmButtonColor: '#cc001e',
                    width: "46rem",
                });
                break;

            case "close":
                Swal.close();

                break;
        }
    }

    uploadArchivo(event) {
        let archivoObtenido = event.target.files[0];

        if (archivoObtenido["type"] !== "application/pdf" && archivoObtenido["type"] !== "application/msword"
            && archivoObtenido["type"] != "application/vnd.ms-excel" && archivoObtenido["type"] != "application/vnd.ms-powerpoint"
            && archivoObtenido["type"] != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            && archivoObtenido["type"] != "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            && archivoObtenido["type"] != "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            this.presentaAlert("error", "Los archivos admitidos son doc,docx, xls,xlsx,ppt,pptx,pdf");

            this.formDocumentos.controls['archivo'].reset();
            return;
        } else {
            this.archivo = event.target.files[0];
        }
    }


    public async onSubmitMacroproceso() {
        console.log("form:", this.form);

        if (this.form.valid) {
            this.presentaAlert('loading');
            const lista = await sp.web.lists.getByTitle('Macroproceso');

            await lista.items.add({
                Title: this.form.controls['nombre'].value,
                C_x00f3_digo: this.form.controls['codigo'].value,
                Descripci_x00f3_n: this.form.controls['descripcion'].value,
                Tipo_x0020_de_x0020_MacroProcesoId: this.form.controls['tipo_macroproceso'].value,
                Estado: this.form.controls['estado'].value,

            }).then(result => {
                this.presentaAlert('close')
                this.presentaAlert('success', '');
                this.form.reset();
            });


        } else {
            this.presentaAlert('error', 'Rellena todos los campos');
        }


    }


    public async onSubmitProceso() {
        console.log("form:", this.formProceso);


        if (this.formProceso.valid) {
            this.presentaAlert('loading');
            const lista = await sp.web.lists.getByTitle('Proceso');

            let duenos_procesos = {
                results: [

                    this.formProceso.controls['dueno_proceso'].value
                ]
            }

            await lista.items.add({
                MacroprocesoId: this.formProceso.controls['macroproceso'].value,
                Title: this.formProceso.controls['nombre'].value,
                Codigo: this.formProceso.controls['codigo'].value,
                CodigoMacroproceso: this.getMacroprocesoById[0].C_x00f3_digo,
                Objetivo: this.formProceso.controls['objetivo'].value,
                DuenoProcesoId: this.formProceso.controls['dueno_proceso'].value,
                Criticidad: this.formProceso.controls['criticidad'].value,
                CertificacionId: this.certificacionId,
                Estado: this.formProceso.controls['estado'].value,
                NombreMacroproceso: this.getMacroprocesoById[0].Title

            }).then(result => {
                this.presentaAlert('close')
                this.presentaAlert('success', '');
                this.formProceso.reset();
            }).catch(err => {
                this.presentaAlert('close');
            });


        } else {
            this.presentaAlert('error', 'Rellena todos los campos');
        }


    }


    public async onSubmitSubProceso() {
        console.log("form:", this.formSubProceso);


        if (this.formSubProceso.valid) {
            this.presentaAlert('loading');
            const lista = await sp.web.lists.getByTitle('SubProceso');


            await lista.items.add({
                C_x00f3_digo: this.formSubProceso.controls['codigo'].value,
                Title: this.formSubProceso.controls['nombre'].value,
                C_x00f3_digoMacroProceso: this.getProcesoById[0].C_x00f3_digoMacroProceso,
                NombreMacroProceso: this.getProcesoById[0].NombreMacroProceso,
                C_x00f3_digoProceso: this.getProcesoById[0].C_x00f3_digo,
                NombreProceso: this.getProcesoById[0].Title,
                Objetivo: this.formSubProceso.controls['objetivo'].value,
                Certificaci_x00f3_nId: this.certificacionId,
                Estado: this.formSubProceso.controls['estado'].value,

            }).then(result => {
                this.presentaAlert('close')
                this.presentaAlert('success', '');
                this.formSubProceso.reset();
            }).catch(err => {
                this.presentaAlert('close');
            });


        } else {
            this.presentaAlert('error', 'Rellena todos los campos');
        }
    }


    public async onSubmitDocumentos() {
        console.log("form:", this.formDocumentos);
        this.presentaAlert('loading');

        if (this.formDocumentos.valid) {
            let directorio = sp.web.getFolderByServerRelativeUrl("/sites/IntranetRT/Centro%20de%20Documentacin/Prueba");
            if (this.registraEjecutor && this.registraAutorizador) {
                if (this.archivo.size <= 10485760) {

                    // small upload

                    await directorio.files.add(this.archivo.name, this.archivo, true).then(result => {
                        result.file.listItemAllFields.get().then((listItemAllFields) => {
                            console.log(this.archivo.name + " upload successfully!");
                            let autorizadores = [];
                            let ejecutores = [];
                            for(const i in this.autorizadores){
                                autorizadores.push(this.autorizadores[i].Title)
                            }

                            for(const i in this.ejecutores){
                                ejecutores.push(this.ejecutores[i].Title)
                            }

                            sp.web.lists.getByTitle("Centro de Documentación").items.getById(listItemAllFields.Id).update({
                                Title: this.archivo.name,
                                Descripcion: this.formDocumentos.controls['descripcion'].value,
                                Estado: this.formDocumentos.controls['estado'].value,
                                Codigo: this.formDocumentos.controls['codigo'].value,
                                TipoDocumentoId: this.formDocumentos.controls['tipo_documento'].value,
                                TipoPublicacionId: this.formDocumentos.controls['tipo_publicacion'].value,
                                Autorizadores:autorizadores.toString(),
                                Ejecutores:ejecutores.toString()

                            }).then(r => {
                               
                               
                                this.actualizaAutorizador(listItemAllFields.Id);
                                this.actualizaEjecutor(listItemAllFields.Id);
                                this.formDocumentos.reset();
                                this.autorizadores = [];
                                this.ejecutores = [];
                                console.log(this.archivo.name + " properties updated successfully!");
                                this.presentaAlert('close');
                                this.presentaAlert('success', '');
                            });
                        });



                    }).catch(err => {
                        this.presentaAlert('error', err.message);
                    });

                } else {
                    console.log("big upload");

                    await directorio.files.addChunked(this.archivo.name, this.archivo, data => {

                        /* Logger.log({ data: data, level: LogLevel.Verbose, message: "progress" }); */

                    }, true).then(result => {

                        result.file.listItemAllFields.get().then((listItemAllFields) => {
                            console.log(this.archivo.name + " upload successfully!");
                            sp.web.lists.getByTitle("Centro de Documentación").items.getById(listItemAllFields.Id).update({
                                Title: this.archivo.name,
                                Descripcion: this.formDocumentos.controls['descripcion'].value,
                                Estado: this.formDocumentos.controls['estado'].value,
                                Codigo: this.formDocumentos.controls['codigo'].value,
                                TipoDocumentoId: this.formDocumentos.controls['tipo_documento'].value,
                                TipoPublicacionId: this.formDocumentos.controls['tipo_publicacion'].value,


                            }).then(r => {
                                console.log(this.archivo.name + " properties updated successfully!");
                                this.presentaAlert('close');
                                this.presentaAlert('success', '');
                                this.formDocumentos.reset();
                                this.autorizadores = [];
                                this.ejecutores = [];
                            });
                        });
                    })
                        .catch(err => {
                            this.presentaAlert('error', err.message);
                        });
                }
            } else {
                this.presentaAlert('error', 'Debes registrar al menos un Autorizador y un ejecutor');
            }



        } else {
            this.presentaAlert('error', 'Rellena todos los campos');
        }
    }

    public async onSubmitAutorizadores() {
        console.log("form:", this.formAutorizadores);
        this.presentaAlert('loading');
 
        if (this.formAutorizadores.valid) {
            const lista = await sp.web.lists.getByTitle('Autorizadores');


            await lista.items.add({
                Title: this.formAutorizadores.controls['nombre'].value,
                UserId: this.formAutorizadores.controls['userId'].value,
                Rol: this.formAutorizadores.controls['rol'].value,
                TipoUsuarioId: this.formAutorizadores.controls['tipo_autorizador'].value,
                Estado: this.formAutorizadores.controls['estado'].value,

            }).then(result => {
                result.item.get().then(item => {
                    console.log("item:", item);

                    this.autorizadorID = item.Id;

                });
                this.presentaAlert('close')
                this.presentaAlert('success', '');
                this.formAutorizadores.reset();
                this.registraAutorizador = true;
                this.getAutorizadores();
            }).catch(err => {
                this.presentaAlert('close');
            });
        } else {
            this.presentaAlert('error', 'Rellena todos los campos');
        }
    }

    public async onSubmitEjecutores() {
        console.log("form:", this.formEjecutores);
        this.presentaAlert('loading');
    
        if (this.formEjecutores.valid) {
            const lista = await sp.web.lists.getByTitle('Ejecutores');


            await lista.items.add({
                Title: this.formEjecutores.controls['nombre'].value,
                UserId: this.formEjecutores.controls['userId'].value,
                Rol: this.formEjecutores.controls['rol'].value,
                TipoUsuarioId: this.formEjecutores.controls['tipo_ejecutor'].value,
                Estado: this.formEjecutores.controls['estado'].value,

            }).then(result => {

                result.item.get().then(item => {
                    console.log("item ejecutor :", item);

                    this.ejecutorID = item.Id;

                });
                this.presentaAlert('close')
                this.presentaAlert('success', '');
                this.formEjecutores.reset();
                this.registraEjecutor = true;
                this.getEjecutores();
            }).catch(err => {
                this.presentaAlert('close');
            });
        } else {
            this.presentaAlert('error', 'Rellena todos los campos');
        }
    }


    public async actualizaAutorizador(id) {
        await sp.web.lists.getByTitle("Autorizadores").items.getById(this.autorizadorID).update({
            DocumentoIdId: id,
        });

    }

    public async actualizaEjecutor(id) {
        await sp.web.lists.getByTitle("Ejecutores").items.getById(this.ejecutorID).update({
            DocumentoIdId: id,
        });
    }


}