/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DataService } from './data.service';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { AircraftComponent } from './Aircraft/Aircraft.component';
import { FlightComponent } from './Flight/Flight.component';

import { ACMENetworkAdminComponent } from './ACMENetworkAdmin/ACMENetworkAdmin.component';
import { ACMEPersonnelComponent } from './ACMEPersonnel/ACMEPersonnel.component';
import { B2BPartnerComponent } from './B2BPartner/B2BPartner.component';

import { CreateFlightComponent } from './CreateFlight/CreateFlight.component';
import { AssignAircraftComponent } from './AssignAircraft/AssignAircraft.component';
import { UpdateAircraftInBatchComponent } from './UpdateAircraftInBatch/UpdateAircraftInBatch.component';

import { AllTransactionsComponent } from './AllTransactions/AllTransactions.component';    //ADDED MANUALLY

  @NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AircraftComponent,
    FlightComponent,
    ACMENetworkAdminComponent,
    ACMEPersonnelComponent,
    B2BPartnerComponent,
    CreateFlightComponent,
    AssignAircraftComponent,
    UpdateAircraftInBatchComponent,
    AllTransactionsComponent,    //ADDED MANUALLY
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
