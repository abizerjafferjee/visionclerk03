import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-dedupe',
  templateUrl: './dedupe.component.html',
  styleUrls: ['./dedupe.component.css']
})
export class DedupeComponent implements OnInit {

  tableId;
  cluster_groups;
  url = "http://localhost:3000"

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id');
  }

  getClusters() {
    this.http.post(this.url + '/apps/dedupe', {"id":this.tableId})
      .subscribe(resp => {
        if (resp["success"]) {
          this.cluster_groups = resp['clusters'];
          for (let cluster in this.cluster_groups) {
            // console.log(this.cluster_groups[cluster]);
            // this.cluster_groups[cluster]['rep_columns'] = Object.keys(this.cluster_groups[cluster]['canonical_rep']);
            this.cluster_groups[cluster]['rep_columns'] = ['invoice_number', 'invoice_net_amount', 'source']
            this.cluster_groups[cluster]['canonical_rep_date'] = new MatTableDataSource([this.cluster_groups[cluster]['canonical_rep']]);
            // this.cluster_groups[cluster]['records_columns'] = Object.keys(this.cluster_groups[cluster]['records'][0]);
            this.cluster_groups[cluster]['records_columns'] = ['invoice_number', 'invoice_net_amount', 'source', 'cluster_id', 'confidence']
            this.cluster_groups[cluster]['records_data'] = new MatTableDataSource(this.cluster_groups[cluster]['records']);
          }
          console.log(this.cluster_groups);
        }
      }, err => {

      });
  }

  mergeAllRows(cluster_id) {
    var send_group;
    for (let cluster in this.cluster_groups) {
      if (this.cluster_groups[cluster]['cluster_id'] == cluster_id) {
        var group = this.cluster_groups[cluster];
        send_group = {'cluster_id': group['cluster_id'], 'canonical_rep': group['canonical_rep'], 'records': group['records']}
      }
    }
    console.log(send_group);
    this.http.post(this.url + '/apps/dedupe/mergeCluster', {'id':this.tableId, 'group': send_group})
      .subscribe(resp => {
        if (resp["success"]) {
        }
      }, err => {
        console.log(err);
      });

      console.log('ran');
  }

}
