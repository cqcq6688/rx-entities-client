import React, { useCallback } from "react";
import intl from "react-intl-universal";
import {
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
} from "@mui/material";
import LazyTextField from "components/EntityBoard/PropertyBox/LazyTextField";
import { EntityMeta, EntityType } from "../meta/EntityMeta";
import { JsonInput } from "./JsonInput";
import { useChangeEntity } from "../hooks/useChangeEntity";
import { useServiceId } from "../hooks/useServiceId";

export const EntityPanel = (props: { entity: EntityMeta }) => {
  const { entity } = props;
  const serviceId = useServiceId();
  const changeEntity = useChangeEntity(serviceId);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<{ value: string }>) => {
      changeEntity({ ...entity, name: event.target.value.trim() });
    },
    [changeEntity, entity]
  );

  const handleTableNameChange = useCallback(
    (event: React.ChangeEvent<{ value: string }>) => {
      changeEntity({ ...entity, tableName: event.target.value.trim() });
    },
    [changeEntity, entity]
  );

  const handleTypeChange = useCallback(
    (event: SelectChangeEvent<EntityType>) => {
      const entityType = event.target.value as EntityType;
      changeEntity({ ...entity, entityType: entityType });
    },
    [changeEntity, entity]
  );

  const handleEnumValuesChange = useCallback(
    (value: any) => {
      changeEntity({ ...entity, enumValues: value });
    },
    [changeEntity, entity]
  );

  const handleEventableChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      changeEntity({ ...entity, root: event.target.checked });
    },
    [changeEntity, entity]
  );

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<{ value: string }>) => {
      changeEntity({ ...entity, description: event.target.value });
    },
    [changeEntity, entity]
  );

  return (
    <>
      <Grid item xs={12}>
        <LazyTextField
          label={intl.get("name")}
          value={entity.name || ""}
          onChange={handleNameChange}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel>{intl.get("type")}</InputLabel>
          <Select
            value={entity.entityType || EntityType.Entity}
            onChange={handleTypeChange}
            label={intl.get("type")}
          >
            <MenuItem value={EntityType.Entity}>
              {intl.get("normal-class")}
            </MenuItem>
            <MenuItem value={EntityType.Enum}>{intl.get("enum")}</MenuItem>
            <MenuItem value={EntityType.Interface}>
              {intl.get("interface")}
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {entity.entityType !== EntityType.Enum &&
        entity.entityType !== EntityType.Interface && (
          <>
            <Grid item xs={12}>
              <LazyTextField
                label={intl.get("table-name")}
                value={entity.tableName || ""}
                onChange={handleTableNameChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={entity.root || false}
                    onChange={handleEventableChange}
                    color="primary"
                  />
                }
                label={intl.get("root")}
              />
            </Grid>
          </>
        )}

      {entity.entityType === EntityType.Enum && (
        <Grid item xs={12}>
          <JsonInput
            label={intl.get("enum-values")}
            value={entity.enumValues}
            onChange={handleEnumValuesChange}
            title={intl.get("edit-enum")}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <LazyTextField
          label={intl.get("description")}
          value={entity.description || ""}
          multiline
          rows = {4}
          onChange={handleDescriptionChange}
        />
      </Grid>
    </>
  );
};
