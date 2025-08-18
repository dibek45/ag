import { Component } from '@angular/core';
import { AdmobService } from '../admob.service';

@Component({
  selector: 'app-rewarded-ad',
  templateUrl: './rewarded-ad.component.html',
  styleUrls: ['./rewarded-ad.component.css']
})
export class RewardedAdComponent {
  constructor(private admobService: AdmobService) {}

  verAnuncio() {
    this.admobService.showRewardedAd();
  }
}
