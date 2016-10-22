-- FUNCTION: public.GetPortfolioRealValueById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioRealValueById(integer);

CREATE OR REPLACE FUNCTION public.GetPortfolioRealValueById
(
    s_portfolioid INTEGER
)
RETURNS TABLE (
    ticker VARCHAR(8),
    value NUMERIC
)
AS
$$
BEGIN
	DROP TABLE IF EXISTS StockQuantity;
	CREATE TEMP TABLE StockQuantity (
    	ticker VARCHAR(8),
    	quantity BIGINT
    );

	INSERT INTO StockQuantity (ticker, quantity)
    SELECT
        T.ticker,
        Sum(T.quantity)
    FROM portfolios AS P
    INNER JOIN transactions AS T ON T.portfolioid = P.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1
    GROUP BY T.ticker;


    DROP TABLE IF EXISTS OutputTable;
	CREATE TEMP TABLE OutputTable (
        ticker VARCHAR(8),
        value NUMERIC
    );

    INSERT INTO OutputTable (ticker, value)
    SELECT
    	SQ.ticker,
        SUM(SQ.quantity * SL.price)
    FROM StockQuantity AS SQ
    LEFT OUTER JOIN stock_live AS SL ON SQ.ticker = SL.ticker
    WHERE SL.datetime = ( SELECT MAX(datetime) FROM stock_live AS SL2 WHERE SL2.ticker = SL.ticker )
    GROUP BY SQ.ticker;
    
    INSERT INTO OutputTable (ticker, value)
    SELECT
        T.ticker,
        Sum(T.quantity * T.price)
    FROM portfolios AS P
    INNER JOIN transactions AS T ON T.portfolioid = P.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1
      AND T.ticker = 'RESERVE'
    GROUP BY T.ticker;

    RETURN QUERY
    SELECT *
    FROM OutputTable;
    
END;
$$

LANGUAGE 'plpgsql'