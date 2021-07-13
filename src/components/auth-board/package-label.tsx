import { makeStyles, Theme, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding:theme.spacing(0.8, 0),
      display:'flex',
      alignItems:'center',
    },
  }),
);

export function PackageLabel(props:{
  children:any,
}){
  const {children} = props;
  const classes = useStyles();
  return(
    <div className = {classes.root}>
      {children}
    </div>
  )
}