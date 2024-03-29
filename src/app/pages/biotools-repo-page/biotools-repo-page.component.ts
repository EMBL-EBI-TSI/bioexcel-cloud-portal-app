import { Component } from '@angular/core';
import { NgForm, FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { Router } from '@angular/router';
import { BiotoolsApplicationService } from './services/biotools-application.service';
import { BiotoolsApplication } from './services/biotools-application';
import { ErrorService, DeploymentService, Application, ApplicationService,
  CredentialService, TokenService, Configuration, ConfigurationService, AuthService
} from 'ng2-cloud-portal-service-lib';
import { DeployNfsClientModalComponent } from './deploy-nfs-client-modal.component';
import { DeployEcpImageModalComponent } from './deploy-ecp-image-modal.component';
import {environment} from '../../../environments/environment';
import {DeployBinderModalComponent} from './deploy-binder-modal.component';
import {DeployBiotoolModalComponent} from './deploy-biotool-modal.component';

@Component({
  selector: 'biotools-repo-page',
  styleUrls: [ './biotools-repo-page.component.css' ],
  templateUrl:  './biotools-repo-page.component.html',
})
export class BiotoolsRepoPageComponent {

  public totalItems: number;
  public currentPage: number = 1;

  bsModalRef: BsModalRef;
  applications: BiotoolsApplication[];
  selectedApplication: BiotoolsApplication;
  selectedApplicationForNfs: BiotoolsApplication;
  selectedApplicationForEcp: BiotoolsApplication;
  configurations: ConfigurationService[];
  sharedConfigurations: ConfigurationService[];
  currentlySelectedConfiguration: Configuration;
  currentlySelectedConfigurationForNfs: Configuration;
  currentlySelectedConfigurationForEcp: Configuration;
  newBioToolsDeploymentForm: FormGroup;
  newNfsClientDeploymentForm: FormGroup;
  newEcpImageDeploymentForm: FormGroup;

  constructor(      private fb: FormBuilder,
                    private _biotoolsApplicationService: BiotoolsApplicationService,
                    private _errorService: ErrorService,
                    private _router: Router,
                    public credentialService: CredentialService,
                    public tokenService: TokenService,
                    public deploymentService: DeploymentService,
                    public applicationService: ApplicationService,
                    public configurationService: ConfigurationService,
                    private modalService: BsModalService,
                    private _authService: AuthService) {
    this._updateRepository();
    if (this.tokenService.getToken()) this.updateConfigurations(true);
    this.newBioToolsDeploymentForm = this.fb.group({
      'sshKey': ['']
    });
    this.newEcpImageDeploymentForm = this.fb.group({
      'sshKey': ['']
    });
    this.newNfsClientDeploymentForm = this.fb.group({
      'sshKey': [''],
      'nfsServerHost': [''],
      'nfsRemoteFolder': ['']
    });
  }

  public setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }

  public pageChanged(event: any): void {
    this.currentPage = event.page;
    console.log('Page changed to: ' + event.page);
    console.log('Current page is: ' + this.currentPage);
    console.log('Number items per page: ' + event.itemsPerPage);
    this._updateRepository();
  }

  public setCurrentlySelectedConfiguration(configuration: Configuration) {
    this.currentlySelectedConfiguration = configuration;
  }

  public setCurrentlySelectedConfigurationForNfs(configuration: Configuration) {
    this.currentlySelectedConfigurationForNfs = configuration;
  }

  public setCurrentlySelectedConfigurationForEcp(configuration: Configuration) {
    this.currentlySelectedConfigurationForEcp = configuration;
  }

  public updateConfigurations(open:boolean):void {
    if (open) {
      this.configurationService.getAll(
        this.credentialService.getUsername(),
        this.tokenService.getToken())
        .subscribe(
          configurations => {
            console.log('[BiotoolsRepoPage] configurations data is %O', configurations);
            this.configurations = configurations
          },
          error => {
            console.log('[BiotoolsRepoPage] error %O', error);
            if (error[0]) {
              error = error[0];
            }
            this._errorService.setCurrentError(error);
            this._router.navigateByUrl('/error');
          },
          () => {
            console.log('[BiotoolsRepoPage] configurations data retrieval complete');
          }
        );

      this.configurationService.getAllSharedConfigurations(
        this.credentialService.getUsername(),
        this.tokenService.getToken())
        .subscribe(
          sharedConfigurations => {
            console.log('[BiotoolsRepoPage] shared configurations data is %O', sharedConfigurations);
            this.sharedConfigurations = sharedConfigurations
          },
          error => {
            console.log('[BiotoolsRepoPage] error %O', error);
            if (error[0]) {
              error = error[0];
            }
            this._errorService.setCurrentError(error);
            this._router.navigateByUrl('/error');
          },
          () => {
            console.log('[BiotoolsRepoPage] shared configurations data retrieval complete');
          }
        );
    }
  }

  private _updateRepository() {
    this._biotoolsApplicationService.getAll(this.currentPage)
      .subscribe(
        applicationPage => {
          console.log('[BiotoolsRepoPage] Applications data is %O', applicationPage);
          this.applications = applicationPage.list;
          this.totalItems = applicationPage.count;
          console.log('Application length' + this.applications.length);
          this.updateIcons(this.applications);
        },
        error => {
          console.log('[BiotoolsRepoPage] error %O', error);
          this._errorService.setCurrentError(error);
          this._router.navigateByUrl('/error');
        },
        () => {
          console.log('[BiotoolsRepoPage] Applications data retrieval complete');
        }
      );
  }

  public deployBiotoolsApplication(application: BiotoolsApplication, sshKey: string) {

    console.log('[BiotoolsRepoPage] Adding BioExcel launcher deployment for application '
      + application.name + ' from ' + application.download[0].url + ' into %O',
      this.currentlySelectedConfiguration);

    this.deploymentService.add(
      this.credentialService.getUsername(),
      this.tokenService.getToken(),
      <Application>{
        name: 'BioExcel launcher',
        accountUsername: 'usr-36d0f1c6-527d-4408-ae6d-7c425a022087',
        repoUri:'https://github.com/EMBL-EBI-TSI/cpa-bioexcel-launcher'
      },
      null,
      {},
      {
        application_name: application.name,
        image_source_url: application.download[0].url
      },
      {},
      <Configuration>this.currentlySelectedConfiguration,
      sshKey
    ).subscribe(
      deployment  => {
        console.log('[ApplicationComponent] deployed %O', deployment);
        this._router.navigateByUrl('/deployments');
      },
      error => {
        console.log('[ApplicationComponent] error %O', error);
        if (error[0]) {
          error = error[0];
        }
        this._errorService.setCurrentError(error);
        this._router.navigateByUrl('/error');
      }
    );
  }

  public deployECPApplication(application: BiotoolsApplication, sshKey: string, downloadNote: string) {

    console.log('[BiotoolsRepoPage] Deploying ECP application through portal. Repo URL : '+application.download[0].url);
    var downloadinfo = downloadNote.split(";");
    var applicationName = downloadinfo[1].replace('name:','');
    var teamName = downloadinfo[2].replace('teamName:','');
    var configName = downloadinfo[3].replace('config:','');
    console.log('Application [%O], teamName [%O], configName [%O] ',applicationName, teamName, configName);
    this.deploymentService.teamShared(
      this.credentialService.getUsername(),
      this.tokenService.getToken(),
      teamName,
      <Application>{
        name: applicationName,
        repoUri: application.download[0].url},
      {
        application_name: application.name
      },
      <Configuration>{name: configName, accountUsername: null},
      sshKey
    ).subscribe(
      deployment  => {
        console.log('[ApplicationComponent] deployed %O', deployment);
        this._router.navigateByUrl('/deployments');
      },
      error => {
        console.log('[ApplicationComponent] error %O', error);
        if (error[0]) {
          error = error[0];
        }
        this._errorService.setCurrentError(error);
        this._router.navigateByUrl('/error');
      }
    );
  }



  public deployEcpImageApplication(application: BiotoolsApplication, sshKey: string) {

    console.log('[BiotoolsRepoPage] Adding ECP image deployment for application '
      + application.name + ' from ' + application.download[0].url + ' into %O',
      this.currentlySelectedConfiguration);

    this.deploymentService.add(
      this.credentialService.getUsername(),
      this.tokenService.getToken(),
      <Application>{
        name: 'Generic server instance',
        accountUsername: 'usr-36d0f1c6-527d-4408-ae6d-7c425a022087',
        repoUri:'https://github.com/EMBL-EBI-TSI/cpa-instance'
      },
      null,
      {},
      {
        application_name: application.name
      },
      {},
      <Configuration>this.currentlySelectedConfigurationForEcp,
      sshKey
    ).subscribe(
      deployment  => {
        console.log('[ApplicationComponent] deployed %O', deployment);
        this._router.navigateByUrl('/deployments');
      },
      error => {
        console.log('[ApplicationComponent] error %O', error);
        if (error[0]) {
          error = error[0];
        }
        this._errorService.setCurrentError(error);
        this._router.navigateByUrl('/error');
      }
    );
  }

  public deployNfsClientApplication(application: BiotoolsApplication, sshKey: string, nfsServerHost: string) {

    console.log('[BiotoolsRepoPage] Adding NFS client deployment for application '
      + application.name + ' from ' + application.download[0].url + ' into %O',
      this.currentlySelectedConfiguration);

    this.deploymentService.add(
      this.credentialService.getUsername(),
      this.tokenService.getToken(),
      <Application>{
        name: 'NFS-Client',
        accountUsername: 'usr-36d0f1c6-527d-4408-ae6d-7c425a022087',
        repoUri:'https://github.com/EMBL-EBI-TSI/cpa-nfs-client'
      },
      null,
      {},
      {
        application_name: application.name,
        nfs_server_host: nfsServerHost,
      },
      {},
      <Configuration>this.currentlySelectedConfigurationForNfs,
      sshKey
    ).subscribe(
      deployment  => {
        console.log('[ApplicationComponent] deployed %O', deployment);
        this._router.navigateByUrl('/deployments');
      },
      error => {
        console.log('[ApplicationComponent] error %O', error);
        if (error[0]) {
          error = error[0];
        }
        this._errorService.setCurrentError(error);
        this._router.navigateByUrl('/error');
      }
    );
  }

  public openDeployBiotoolModal() {
    this.bsModalRef = this.modalService.show(DeployBiotoolModalComponent);
    this.bsModalRef.content.title = 'Deploy tool';
    this.bsModalRef.content.biotoolsRepoPageComponent = this;
    this.bsModalRef.content.applicationType = 'biotools';
  }

  public openDeployECPAppModal(application: BiotoolsApplication, note: String) {
    this.bsModalRef = this.modalService.show(DeployBiotoolModalComponent);
    this.bsModalRef.content.title = 'Deploy "'+application.name+'" to '+this.getConfigName(note);
    this.bsModalRef.content.biotoolsRepoPageComponent = this;
    this.bsModalRef.content.applicationType = 'ecpapp';
    this.bsModalRef.content.downloadNote = note;
  }

  public openNewBinder(application: BiotoolsApplication){
    var binderRepoUrl = this.getBinderRepoUrl(application);
    this.refreshToken(binderRepoUrl);
  }

  public openExistingBinder(){
    var username = this.credentialService.getUsername();
    var hubhomeURL = environment.binderHubAPI.replace("hub/","user/")+username;
    this.refreshToken(hubhomeURL);
  }

  public refreshToken(windowUrl: string){
    this._authService.getRefreshToken(this.tokenService.getToken()).subscribe(
      res => {
        console.log('[ApplicationComponent]  token got refreshed %O', res);
        this.tokenService.setToken(res);
        this.loginAndOpen(windowUrl);
      },
      error => {
        console.log('[ApplicationComponent] error %O', error);
        this.loginAndOpen(windowUrl);
      }
    );
  }


  public loginAndOpen(windowURL: string) {

    var hubLoginURI = environment.binderHubAPI+'login';
    this.deploymentService.loginBinder(this.tokenService.getToken(),
      hubLoginURI).subscribe(
      res => {
        console.log('[ApplicationComponent] Login success !');
        window.open(windowURL, '_blank');
      },
      error => {
        console.log('[ApplicationComponent] error %O', error);
        window.open(windowURL, '_blank');
      }
    );
  }

  public openBinderAppModal(application: BiotoolsApplication) {
    this.bsModalRef = this.modalService.show(DeployBinderModalComponent);
    this.bsModalRef.content.title = 'Open "' + application.name + '" on Binder';
    this.bsModalRef.content.tutorial = application.name;
    this.bsModalRef.content.biotoolsRepoPageComponent = this;
  }

  private getBinderRepoUrl(application: BiotoolsApplication){
    var downloadArray = application.download;
    for (var download of downloadArray) {
      if(download.note != null && download.note.includes("BioExcel_Binder_Application"))
        return download.url;
    }
  }

  public openDeployNfsClientModal() {
    this.bsModalRef = this.modalService.show(DeployNfsClientModalComponent);
    this.bsModalRef.content.title = 'Deploy NFS client';
    this.bsModalRef.content.biotoolsRepoPageComponent = this;
  }

  public openDeployEcpImageModal() {
    this.bsModalRef = this.modalService.show(DeployEcpImageModalComponent);
    this.bsModalRef.content.title = 'Deploy NFS client';
    this.bsModalRef.content.biotoolsRepoPageComponent = this;
  }

  public getConfigName(note: String) {
    const downloadinfo = note.split(';');
    return downloadinfo[3].replace('config:','');
  }

  private updateIcons(biotoolsApplication: BiotoolsApplication[]): void {

    for (var application of biotoolsApplication) {
      application.icons = {cloud: false, book: false, binder: false, globe: false, window: false};

      console.log('Checking if application is of type Notebook');
      if (application.toolType.length > 0 && application.toolType.indexOf('Notebook') >= 0) {
        application.icons.book = true;
      }

      for (const d of application.download) {
        if (d.note != null && (d.note.includes('Jupyter'))) {
          application.icons.book = true;
        }
        if (d.note != null && (d.note.includes('BioExcel_Binder_Application'))) {
          console.log('Checking if application is of type Binder');
          application.icons.binder = true;
        }
        if (d.type === 'VM image' &&
          (d.note != null && (d.note === 'BioExcel_Embassy_VM' || d.note === 'BioExcel_Embassy_NFS_Image' ||
              d.note === 'BioExcel_Embassy_ECP_Image' ||
              d.note.includes('BioExcel_ECP_Application'))
          )) {
          console.log('Checking if application is deployable in Cloud');
          application.icons.cloud = true;
        }
      }

      console.log('Checking if application is CLI/Library/Workbench/Suite/Desktop-Application');
      if ((application.toolType.length > 0) &&
        (application.toolType.indexOf('Library') >= 0
          || application.toolType.indexOf('Command-line tool') >= 0
          || application.toolType.indexOf('Workbench') >= 0
          || application.toolType.indexOf('Suite') >= 0
          || application.toolType.indexOf('Desktop application') >= 0)) {
        application.icons.window = true;
      }
    }

    console.log('Checking if application is a WebService');
    if ((application.toolType.length > 0) &&
      (application.toolType.indexOf('Web service') >= 0 || application.toolType.indexOf('Web API') >= 0 ||
        application.toolType.indexOf('Web application') >= 0)) {
      application.icons.globe = true;
    }
  }
}
