import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer } from '@angular/platform-browser';
import { Genre } from "../../../models/resources/genre";
import { LibraryItem } from "../../../models/resources/library-item";
import { Page } from "../../../models/page";
import { HttpClient } from "@angular/common/http";
import { IResource } from "../../../models/resources/resource";
import { Show, ShowRole } from "../../../models/resources/show";
import { Collection } from "../../../models/resources/collection";
import { Studio } from "../../../models/resources/studio";
import { ItemsUtils } from "../../misc/items-utils";
import { PreLoaderService } from "../../services/pre-loader.service";

@Component({
	selector: 'app-items-grid',
	templateUrl: './items-grid.component.html',
	styleUrls: ['./items-grid.component.scss']
})
export class ItemsGridComponent implements OnInit
{
	@Input() page: Page<LibraryItem | Show | ShowRole | Collection>;
	@Input() sortEnabled: boolean = true;

	complexFiltersEnabled: boolean;
	defaultType: string;

	sortType: string = "title";
	sortKeys: string[] = ["title", "start year", "end year"]
	sortUp: boolean = true;

	filters: {genres: Genre[], studio: Studio} = {genres: [], studio: null};
	genres: Genre[] = [];
	studios: Studio[] = [];

	constructor(private route: ActivatedRoute,
	            private sanitizer: DomSanitizer,
	            private loader: PreLoaderService,
	            public client: HttpClient)
	{
		this.route.data.subscribe((data) =>
		{
			this.page = data.items;
		});
		this.loader.load<Genre>("/api/genres?limit=0").subscribe(data =>
		{
			this.genres = data;
		});
		this.loader.load<Studio>("/api/studios?limit=0").subscribe(data =>
		{
			this.studios = data;
		});
	}

	ngOnInit()
	{
		this.defaultType = this.page.this.match(/\/(\w*)($|\?)/)[1];
		this.complexFiltersEnabled = this.defaultType == "shows" || this.defaultType == "items";
	}

	getFilterCount()
	{
		let count: number = this.filters.genres.length;
		if (this.filters.studio != null)
			count++;
		return count;
	}

	addFilter(category: string, filter: IResource, isArray: boolean = true, isShowOnly: boolean = true)
	{
		if (!this.complexFiltersEnabled)
			return;
		let useShow: boolean;

		if (isArray)
		{
			if (this.filters[category].includes(filter))
			{
				this.filters[category].splice(this.filters[category].indexOf(filter), 1);
				useShow = this.getFilterCount() != 0;
			}
			else
			{
				this.filters[category].push(filter);
				useShow = true;
			}
		}
		else
		{
			if (this.filters[category] == filter)
			{
				this.filters[category] = null;
				useShow = false;
			}
			else
			{
				this.filters[category] = filter;
				useShow = filter != null;
			}
		}

		let url: URL = new URL(this.page.first);
		if (isShowOnly)
		{
			url = useShow
				? new URL(this.page.changeType("shows"))
				: new URL(this.page.changeType(this.defaultType));
		}

		if (isArray && this.filters[category].length > 0)
			url.searchParams.set(category, `ctn:${this.filters[category].map(x => x.slug).join(',')}`);
		else if (!isArray && this.filters[category] != null)
			url.searchParams.set(category, filter.slug)
		else
			url.searchParams.delete(category)
		this.client.get<Page<Show>>(url.toString())
			.subscribe(x => this.page = Object.assign(new Page<Show>(), x));
	}

	getThumb(slug: string)
	{
		return this.sanitizer.bypassSecurityTrustStyle("url(/poster/" + slug + ")");
	}

	getDate(item: LibraryItem | Show | ShowRole | Collection)
	{
		return ItemsUtils.getDate(item);
	}

	getLink(item: LibraryItem | Show | ShowRole | Collection)
	{
		return ItemsUtils.getLink(item);
	}

	sort(type: string, order: boolean)
	{
		this.sortType = type;
		this.sortUp = order;

		let url: URL = new URL(this.page.first);
		url.searchParams.set("sortBy", `${this.sortType.replace(/\s/g, "")}:${this.sortUp ? "asc" : "desc"}`);
		this.client.get<Page<LibraryItem | Show>>(url.toString())
			.subscribe(x => this.page = Object.assign(new Page<LibraryItem | Show>(), x));
	}
}
