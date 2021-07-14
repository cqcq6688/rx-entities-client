import { FormControlLabel, Checkbox } from "@material-ui/core";
import { RxAbility } from "entity-interface/rx-ability";
import React from "react";
import { ActionLabel } from "./action-label";
import ExpressDialog from "./express-dialog";


export function ActionWithExpression(props:{
  label: string,
  ability: RxAbility,
  onAbilityChange:(ability:RxAbility)=>void,
  noExpression?:boolean,
}){
  const {label, ability, onAbilityChange, noExpression} = props;

  const handleCanChange = (event:React.ChangeEvent<HTMLInputElement>)=>{
    onAbilityChange({...ability, can: event.target.checked});
  }

  const handleExpChange = (exp:string)=>{
    onAbilityChange({...ability, expression: exp});
  }

  return(
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={ability.can}
            onChange={handleCanChange}
            color="primary"
            size = "small"
          />
        }
        label={<ActionLabel>{label}</ActionLabel>}
      />
      {
        ability.can && !noExpression &&
        <ExpressDialog expression = {ability.expression} onExpressionChange = {handleExpChange}/>
      }
    </>
  )
}