import '../../polyfills';
import 'reflect-metadata';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

// import styles from './MenuIntraRgtWebPart.module.scss';
import * as strings from 'MenuIntraRgtWebPartStrings';
import { MenuIntraRgtModule } from './MenuIntraRgtModule';

export interface IMenuIntraRgtWebPartProps {
  description: string;
}

if (!window['Zone']) {
  require('zone.js');
}
require('bootstrap/dist/js/bootstrap');



export default class MenuIntraRgtWebPart extends BaseClientSideWebPart<IMenuIntraRgtWebPartProps> {

  public render(): void {
    window['webPartContextMenuIntraRgt'] = this.context;
    window['webPartPropertiesMenuIntraRgt'] = this.properties;
    this.domElement.innerHTML = `<menu-intra-rgt></menu-intra-rgt>`;
    platformBrowserDynamic().bootstrapModule(MenuIntraRgtModule);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
