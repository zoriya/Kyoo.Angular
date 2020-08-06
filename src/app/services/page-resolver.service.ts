import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Observable, EMPTY} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Page} from "../../models/page";
import {IResource} from "../../models/resources/resource";

@Injectable()
export class PageResolver
{
	public static resolvers: any[] = [];

	static forResource<T extends IResource>(resource: string)
	{
		@Injectable()
		class Resolver implements Resolve<Page<T>>
		{
			constructor(private http: HttpClient,
			            private snackBar: MatSnackBar)
			{ }

			resolve(route: ActivatedRouteSnapshot): Page<T> | Observable<Page<T>> | Promise<Page<T>>
			{
				let res: string = resource.replace(/:(.*?)(\/|$)/, (x, y) => `${route.paramMap.get(y)}/`);

				return this.http.get<Page<T>>(`api/${res}`)
					.pipe(
						map(x => Object.assign(new Page<T>(), x)),
						catchError((error: HttpErrorResponse) =>
						{
							console.log(error.status + " - " + error.message);
							this.snackBar.open(`An unknown error occurred: ${error.message}.`, null, {
								horizontalPosition: "left",
								panelClass: ['snackError'],
								duration: 2500
							});
							return EMPTY;
						}));
			}
		}
		PageResolver.resolvers.push(Resolver);
		return Resolver;
	}
}