import React, { useMemo, useState } from "react";
import { FunctionFragment } from "@ethersproject/abi";
import { Box, makeStyles, Typography } from "@material-ui/core";
import { Collapsable } from "../../../components/Collapsable";
import { ContractQueryForm } from "../../../components/ethereum/ContractQueryForm";
import { TextField } from "../../../components/input/TextField";
import { getWriteFunction } from "../../../utils/contracts";
import classNames from "classnames";
import { Icon } from "@gnosis.pm/safe-react-components";
import { ModuleTransaction } from "./TransactionBuilder";
import { ActionButton } from "../../../components/ActionButton";
import { ParamInput } from "../../../components/ethereum/ParamInput";

interface AddTransactionBlockProps {
  abi: string | string[];
  onAdd(transaction: ModuleTransaction): void;
}

const useStyles = makeStyles((theme) => ({
  greyText: {
    "& select": {
      color: theme.palette.primary.main,
    },
  },
  icon: {
    color: theme.palette.secondary.main,
  },
  addButton: {
    marginTop: theme.spacing(2),
  },
}));

type TransactionFieldsProps = { func?: FunctionFragment } & Pick<
  AddTransactionBlockProps,
  "onAdd"
>;

const TransactionFields = ({ func, onAdd }: TransactionFieldsProps) => {
  const classes = useStyles();

  if (!func) {
    return (
      <ActionButton
        fullWidth
        disabled
        className={classes.addButton}
        startIcon={
          <Icon className={classes.icon} type="add" size="md" color="primary" />
        }
      >
        Add this transaction
      </ActionButton>
    );
  }

  const handleAdd = (params: any[]) => {
    onAdd({
      id: `${func.name}_${new Date().getTime()}`,
      func,
      params,
    });
  };

  return (
    <ContractQueryForm func={func}>
      {({ paramInputProps, areParamsValid, getParams }) => (
        <>
          {paramInputProps.map((props, index) => (
            <Box marginTop={2} key={index}>
              <ParamInput {...props} />
            </Box>
          ))}
          <ActionButton
            fullWidth
            onClick={() => handleAdd(getParams())}
            disabled={!areParamsValid}
            className={classes.addButton}
            startIcon={
              <Icon
                className={classes.icon}
                type="add"
                size="md"
                color="primary"
              />
            }
          >
            Add this transaction
          </ActionButton>
        </>
      )}
    </ContractQueryForm>
  );
};

export const AddTransactionBlock = ({
  abi,
  onAdd,
}: AddTransactionBlockProps) => {
  const classes = useStyles();
  const writeFunctions = useMemo(() => getWriteFunction(abi), [abi]);
  const [funcIndex, setFuncIndex] = useState<string>("none");

  const handleAdd = (transaction: ModuleTransaction) => {
    setFuncIndex("none");
    onAdd(transaction);
  };

  const content = (
    <>
      <TextField
        select
        value={funcIndex}
        onChange={(event) => setFuncIndex(event.target.value)}
        SelectProps={{ native: true }}
        className={classNames({ [classes.greyText]: funcIndex === "none" })}
        color="secondary"
        label="Function"
      >
        <option value="none">Select function</option>
        {writeFunctions.map((func, index) => (
          <option key={func.format("full")} value={index}>
            {func.name}
          </option>
        ))}
      </TextField>
      <TransactionFields
        key={funcIndex}
        func={
          funcIndex && funcIndex !== "none"
            ? writeFunctions[parseInt(funcIndex)]
            : undefined
        }
        onAdd={handleAdd}
      />
    </>
  );

  return (
    <Collapsable open content={content}>
      <Typography variant="h6">Add new transaction</Typography>
    </Collapsable>
  );
};
