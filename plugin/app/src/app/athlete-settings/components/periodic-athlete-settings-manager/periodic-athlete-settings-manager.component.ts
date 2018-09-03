import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { MatDialog, MatSnackBar, MatTableDataSource } from "@angular/material";
import { PeriodicAthleteSettingsModel } from "../../../../../../shared/models/athlete-settings/periodic-athlete-settings.model";
import { PeriodicAthleteSettingsService } from "../../../shared/services/periodic-athlete-settings/periodic-athlete-settings.service";
import { EditPeriodicAthleteSettingsDialogComponent } from "../edit-periodic-athlete-settings-dialog/edit-periodic-athlete-settings-dialog.component";
import * as _ from "lodash";
import { PeriodicAthleteSettingsTableModel } from "./models/periodic-athlete-settings-table.model";
import { PeriodicAthleteSettingsAction } from "../edit-periodic-athlete-settings-dialog/periodic-athlete-settings-action.enum";
import { PeriodicAthleteSettingsDialogData } from "../edit-periodic-athlete-settings-dialog/periodic-athlete-settings-dialog-data.model";
import { ConfirmDialogComponent } from "../../../shared/dialogs/confirm-dialog/confirm-dialog.component";
import { ConfirmDialogDataModel } from "../../../shared/dialogs/confirm-dialog/confirm-dialog-data.model";
import { AppError } from "../../../shared/models/app-error.model";

@Component({
	selector: "app-periodic-athlete-settings-manager",
	templateUrl: "./periodic-athlete-settings-manager.component.html",
	styleUrls: ["./periodic-athlete-settings-manager.component.scss"]
})
export class PeriodicAthleteSettingsManagerComponent implements OnInit {

	public static readonly COLUMN_SINCE: string = "since";
	public static readonly COLUMN_UNTIL: string = "until";
	public static readonly COLUMN_WEIGHT: string = "weight";
	public static readonly COLUMN_MAX_HR: string = "maxHr";
	public static readonly COLUMN_REST_HR: string = "restHr";
	public static readonly COLUMN_LTHR_DEFAULT: string = "lthr.default";
	public static readonly COLUMN_LTHR_CYCLING: string = "lthr.cycling";
	public static readonly COLUMN_LTHR_RUNNING: string = "lthr.running";
	public static readonly COLUMN_CYCLING_FTP: string = "cyclingFtp";
	public static readonly COLUMN_RUNNING_FTP: string = "runningFtp";
	public static readonly COLUMN_SWIM_FTP: string = "swimFtp";
	public static readonly COLUMN_ACTION_EDIT: string = "edit";
	public static readonly COLUMN_ACTION_DELETE: string = "delete";

	public readonly displayedColumns: string[] = [
		PeriodicAthleteSettingsManagerComponent.COLUMN_SINCE,
		PeriodicAthleteSettingsManagerComponent.COLUMN_UNTIL,
		PeriodicAthleteSettingsManagerComponent.COLUMN_WEIGHT,
		PeriodicAthleteSettingsManagerComponent.COLUMN_MAX_HR,
		PeriodicAthleteSettingsManagerComponent.COLUMN_REST_HR,
		PeriodicAthleteSettingsManagerComponent.COLUMN_LTHR_DEFAULT,
		PeriodicAthleteSettingsManagerComponent.COLUMN_LTHR_CYCLING,
		PeriodicAthleteSettingsManagerComponent.COLUMN_LTHR_RUNNING,
		PeriodicAthleteSettingsManagerComponent.COLUMN_CYCLING_FTP,
		PeriodicAthleteSettingsManagerComponent.COLUMN_RUNNING_FTP,
		PeriodicAthleteSettingsManagerComponent.COLUMN_SWIM_FTP,
		PeriodicAthleteSettingsManagerComponent.COLUMN_ACTION_EDIT,
		PeriodicAthleteSettingsManagerComponent.COLUMN_ACTION_DELETE,
	];

	public periodicAthleteSettingsModels: PeriodicAthleteSettingsModel[];

	public dataSource: MatTableDataSource<PeriodicAthleteSettingsTableModel>;

	@Output("periodicAthleteSettingsModelsChange")
	public periodicAthleteSettingsModelsChange: EventEmitter<void> = new EventEmitter<void>();

	constructor(public periodicAthleteSettingsService: PeriodicAthleteSettingsService,
				public dialog: MatDialog,
				public snackBar: MatSnackBar) {
	}

	public ngOnInit(): void {
		this.dataSource = new MatTableDataSource<PeriodicAthleteSettingsTableModel>();
		this.loadData();
	}

	private loadData(): void {

		this.periodicAthleteSettingsService.fetch().then((periodicAthleteSettingsModels: PeriodicAthleteSettingsModel[]) => {

			this.periodicAthleteSettingsModels = periodicAthleteSettingsModels;

			// Auto creates a periodic athlete settings if no one exists
			if (this.periodicAthleteSettingsModels.length === 0) {
				this.periodicAthleteSettingsService.add(PeriodicAthleteSettingsModel.DEFAULT_MODEL).then(() => {
					this.periodicAthleteSettingsModelsChange.emit();
					this.loadData();
				}, error => {
					this.handleErrors(error);
				});

			} else {
				this.dataSource.data = this.generateTableData(periodicAthleteSettingsModels);
			}

		});
	}

	private generateTableData(periodicAthleteSettingsModels: PeriodicAthleteSettingsModel[]): PeriodicAthleteSettingsTableModel[] {

		const periodicAthleteSettingsTableModels: PeriodicAthleteSettingsTableModel[] = [];
		_.forEach(periodicAthleteSettingsModels, (periodicAthleteSettingsModel: PeriodicAthleteSettingsModel, index: number) => {
			const previousPeriodicAthleteSettingsModel = periodicAthleteSettingsModels[index - 1];
			periodicAthleteSettingsTableModels.push(new PeriodicAthleteSettingsTableModel(periodicAthleteSettingsModel, previousPeriodicAthleteSettingsModel));
		});
		return periodicAthleteSettingsTableModels;
	}

	public onAdd(): void {

		const periodicAthleteSettingsDialogData: PeriodicAthleteSettingsDialogData = {
			action: PeriodicAthleteSettingsAction.ACTION_ADD
		};

		const dialogRef = this.dialog.open(EditPeriodicAthleteSettingsDialogComponent, {
			width: EditPeriodicAthleteSettingsDialogComponent.WIDTH,
			data: periodicAthleteSettingsDialogData
		});

		const afterClosedSubscription = dialogRef.afterClosed().subscribe((periodicAthleteSettingsModel: PeriodicAthleteSettingsModel) => {

			if (periodicAthleteSettingsModel) {
				this.periodicAthleteSettingsService.add(periodicAthleteSettingsModel).then(() => {
					this.periodicAthleteSettingsModelsChange.emit();
					this.loadData();
				}, error => {
					this.handleErrors(error);
				});
			}

			afterClosedSubscription.unsubscribe();
		});
	}

	public onReset(): void {

		const data: ConfirmDialogDataModel = {
			title: "Reset your periodic athlete settings",
			content: "Are you sure to perform this action? Current settings will be lost."
		};

		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			minWidth: ConfirmDialogComponent.MIN_WIDTH,
			maxWidth: ConfirmDialogComponent.MAX_WIDTH,
			data: data
		});

		const afterClosedSubscription = dialogRef.afterClosed().subscribe((confirm: boolean) => {

			if (confirm) {

				this.periodicAthleteSettingsService.reset().then(() => {
					this.periodicAthleteSettingsModelsChange.emit();
					this.loadData();
				}, error => {
					this.handleErrors(error);
				});
			}

			afterClosedSubscription.unsubscribe();
		});
	}

	public onEdit(sinceIdentifier: string): void {

		const periodicAthleteSettingsModelToEdit = _.find(this.periodicAthleteSettingsModels, {since: sinceIdentifier});

		const periodicAthleteSettingsDialogData: PeriodicAthleteSettingsDialogData = {
			action: PeriodicAthleteSettingsAction.ACTION_EDIT,
			periodicAthleteSettingsModel: periodicAthleteSettingsModelToEdit
		};

		const dialogRef = this.dialog.open(EditPeriodicAthleteSettingsDialogComponent, {
			width: EditPeriodicAthleteSettingsDialogComponent.WIDTH,
			data: periodicAthleteSettingsDialogData
		});

		const afterClosedSubscription = dialogRef.afterClosed().subscribe((periodicAthleteSettingsModel: PeriodicAthleteSettingsModel) => {

			if (periodicAthleteSettingsModel) {
				this.periodicAthleteSettingsService.edit(sinceIdentifier, periodicAthleteSettingsModel).then(() => {
					this.periodicAthleteSettingsModelsChange.emit();
					this.loadData();
				}, error => {
					this.handleErrors(error);
				});
			}

			afterClosedSubscription.unsubscribe();
		});

	}

	public onRemove(sinceIdentifier: string): void {

		const confirmDialogDataModel = new ConfirmDialogDataModel(null, "Are you sure to remove this periodic athlete settings?");

		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			data: confirmDialogDataModel
		});

		const afterClosedSubscription = dialogRef.afterClosed().subscribe((confirmed: boolean) => {
			if (confirmed) {
				this.periodicAthleteSettingsService.remove(sinceIdentifier).then(() => {
					this.periodicAthleteSettingsModelsChange.emit();
					this.loadData();
				}, error => {
					this.handleErrors(error);
				});

			}
			afterClosedSubscription.unsubscribe();
		});
	}

	private handleErrors(error: any) {

		console.error(error);

		if (error instanceof AppError) {
			const message = (<AppError> error).message;
			this.snackBar.open(message, "Close");
		}

	}
}
