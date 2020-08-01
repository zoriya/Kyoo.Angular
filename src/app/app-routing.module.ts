import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LibraryItemGridComponent} from './components/library-item-grid/library-item-grid.component';
import {CollectionComponent} from "./collection/collection.component";
import {NotFoundComponent} from './not-found/not-found.component';
import {PlayerComponent} from "./pages/player/player.component";
import {SearchComponent} from "./pages/search/search.component";
import {CollectionResolverService} from "./services/resolvers/collection-resolver.service";
import {PageResolver} from './services/resolvers/page-resolver.service';
import {PeopleResolverService} from "./services/resolvers/people-resolver.service";
import {SearchResolverService} from "./services/resolvers/search-resolver.service";
import {ShowResolverService} from './services/resolvers/show-resolver.service';
import {StreamResolverService} from "./services/resolvers/stream-resolver.service";
import {ShowDetailsComponent} from './pages/show-details/show-details.component';
import {AuthGuard} from "./auth/misc/authenticated-guard.service";
import {LibraryItem} from "../models/library-item";
import {LibraryItemService, LibraryService} from "./services/api.service";

const routes: Routes = [
	{path: "browse", component: LibraryItemGridComponent, pathMatch: "full",
		resolve: { items: PageResolver.forResource<LibraryItem>("items") },
		canLoad: [AuthGuard.forPermissions("read")],
		canActivate: [AuthGuard.forPermissions("read")]
	},
	{path: "browse/:slug", component: LibraryItemGridComponent,
		resolve: { items: PageResolver.forResource<LibraryItem>("library/:slug/items") },
		canLoad: [AuthGuard.forPermissions("read")],
		canActivate: [AuthGuard.forPermissions("read")]
	},

	{path: "show/:show-slug", component: ShowDetailsComponent, resolve: { show: ShowResolverService }, canLoad: [AuthGuard.forPermissions("read")], canActivate: [AuthGuard.forPermissions("read")]},
	{path: "collection/:collection-slug", component: CollectionComponent, resolve: { collection: CollectionResolverService }, canLoad: [AuthGuard.forPermissions("read")], canActivate: [AuthGuard.forPermissions("read")]},
	{path: "people/:people-slug", component: CollectionComponent, resolve: { collection: PeopleResolverService }, canLoad: [AuthGuard.forPermissions("read")], canActivate: [AuthGuard.forPermissions("read")]},
	{path: "watch/:item", component: PlayerComponent, resolve: { item: StreamResolverService }, canLoad: [AuthGuard.forPermissions("play")], canActivate: [AuthGuard.forPermissions("play")]},
	{path: "search/:query", component: SearchComponent, resolve: { items: SearchResolverService }, canLoad: [AuthGuard.forPermissions("read")], canActivate: [AuthGuard.forPermissions("read")]},
	{path: "**", component: NotFoundComponent}
];

@NgModule({
	imports: [RouterModule.forRoot(routes,
		{
			scrollPositionRestoration: "enabled",
		})],
	exports: [RouterModule],
	providers: [
		LibraryService,
		LibraryItemService,
		PageResolver.resolvers,
		ShowResolverService,
		CollectionResolverService,
		PeopleResolverService,
		StreamResolverService,
		SearchResolverService
	]
})
export class AppRoutingModule { }
