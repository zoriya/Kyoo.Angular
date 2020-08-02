import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Show} from "../../../models/show";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
	selector: 'app-show-grid',
	templateUrl: './show-grid.component.html',
	styleUrls: ['./show-grid.component.scss']
})
export class ShowGridComponent
{
	@Input() shows: Show[]
	@Input() externalShows: boolean = false;
	@Output() clickCallback: EventEmitter<Show> = new EventEmitter();
	
	constructor(private sanitizer: DomSanitizer) { }

	getThumb(show: Show)
	{
		return this.sanitizer.bypassSecurityTrustStyle(`url(${show.poster})`);
	}
	
	getLink(show: Show)
	{
		if (this.externalShows)
			return null;
		return `/show/${show.slug}`;
	}
}